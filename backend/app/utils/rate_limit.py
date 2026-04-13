from __future__ import annotations

from collections import deque
from threading import Lock
from time import time
from typing import Deque

from fastapi import HTTPException, Request, status


_RATE_LIMIT_BUCKETS: dict[str, Deque[float]] = {}
_RATE_LIMIT_LOCK = Lock()


def _client_identifier(request: Request | None) -> str:
    if request is None:
        return "unknown"

    forwarded_for = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if forwarded_for:
        return forwarded_for

    if request.client and request.client.host:
        return request.client.host

    return "unknown"


def enforce_rate_limit(
    *,
    request: Request | None,
    scope: str,
    limit: int,
    window_seconds: int,
) -> None:
    if request is None:
        return

    now = time()
    identifier = _client_identifier(request)
    bucket_key = f"{scope}:{identifier}"

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


def reset_rate_limit_state() -> None:
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BUCKETS.clear()
