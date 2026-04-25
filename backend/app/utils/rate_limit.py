from __future__ import annotations

from collections import deque
import logging
from threading import Lock
from time import time
from typing import Deque

from fastapi import HTTPException, Request, status
from redis import Redis
from redis.exceptions import RedisError

from config import settings


logger = logging.getLogger(__name__)


_RATE_LIMIT_BUCKETS: dict[str, Deque[float]] = {}
_RATE_LIMIT_LOCK = Lock()
_REDIS_CLIENT: Redis | None | bool = None
_REDIS_KEY_PREFIX = "rate_limit"


def _client_identifier(request: Request | None) -> str:
    if request is None:
        return "unknown"

    forwarded_for = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if forwarded_for:
        return forwarded_for

    if request.client and request.client.host:
        return request.client.host

    return "unknown"


def _mark_redis_unavailable() -> None:
    global _REDIS_CLIENT
    _REDIS_CLIENT = False


def _get_redis_client() -> Redis | None:
    global _REDIS_CLIENT

    if _REDIS_CLIENT is False:
        return None

    if isinstance(_REDIS_CLIENT, Redis):
        return _REDIS_CLIENT

    try:
        client = Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=0.2,
            socket_timeout=0.2,
            health_check_interval=30,
        )
        client.ping()
        _REDIS_CLIENT = client
        return client
    except Exception as exc:
        logger.warning(
            "Redis-backed rate limiting unavailable, falling back to in-memory buckets",
            exc_info=exc,
        )
        _mark_redis_unavailable()
        return None


def _enforce_in_memory_rate_limit(*, bucket_key: str, limit: int, window_seconds: int) -> None:
    now = time()

    with _RATE_LIMIT_LOCK:
        bucket = _RATE_LIMIT_BUCKETS.setdefault(bucket_key, deque())
        while bucket and (now - bucket[0]) >= window_seconds:
            bucket.popleft()

        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(retry_after)},
            )

        bucket.append(now)


def _enforce_redis_rate_limit(*, bucket_key: str, limit: int, window_seconds: int) -> bool:
    client = _get_redis_client()
    if client is None:
        return False

    redis_key = f"{_REDIS_KEY_PREFIX}:{bucket_key}"

    try:
        current_count = client.incr(redis_key)
        if current_count == 1:
            client.expire(redis_key, window_seconds)
        elif client.ttl(redis_key) < 0:
            client.expire(redis_key, window_seconds)

        if current_count > limit:
            retry_after = client.ttl(redis_key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(max(1, retry_after if retry_after > 0 else window_seconds))},
            )

        return True
    except HTTPException:
        raise
    except RedisError as exc:
        logger.warning(
            "Redis-backed rate limiting failed during request, falling back to in-memory buckets",
            exc_info=exc,
        )
        _mark_redis_unavailable()
        return False


def enforce_rate_limit(
    *,
    request: Request | None,
    scope: str,
    limit: int,
    window_seconds: int,
) -> None:
    if request is None:
        return

    identifier = _client_identifier(request)
    bucket_key = f"{scope}:{identifier}"
    if _enforce_redis_rate_limit(bucket_key=bucket_key, limit=limit, window_seconds=window_seconds):
        return

    _enforce_in_memory_rate_limit(bucket_key=bucket_key, limit=limit, window_seconds=window_seconds)


def reset_rate_limit_state() -> None:
    global _REDIS_CLIENT
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BUCKETS.clear()
    _REDIS_CLIENT = None
