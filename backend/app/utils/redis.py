from __future__ import annotations

import logging
from redis import Redis
from redis.exceptions import RedisError
from config import settings

logger = logging.getLogger(__name__)

_REDIS_CLIENT: Redis | None | bool = None

def get_redis_client() -> Redis | None:
    """
    Returns a singleton Redis client instance.
    If Redis is unavailable, returns None and marks it as unavailable for the current process lifecycle.
    """
    global _REDIS_CLIENT

    if _REDIS_CLIENT is False:
        return None

    if isinstance(_REDIS_CLIENT, Redis):
        return _REDIS_CLIENT

    try:
        client = Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=0.5, # Slightly increased for better reliability
            socket_timeout=0.5,
            health_check_interval=30,
        )
        client.ping()
        _REDIS_CLIENT = client
        logger.info(f"✓ Redis connection established: {settings.REDIS_URL[:20]}...")
        return client
    except Exception as exc:
        logger.warning(
            "Redis is unavailable, falling back to in-memory storage/bypass",
            exc_info=exc,
        )
        _REDIS_CLIENT = False
        return None

def redis_set(key: str, value: str, ex: int | None = None) -> bool:
    """Set a value in Redis with optional expiration (in seconds)"""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.set(key, value, ex=ex))
    except RedisError as exc:
        logger.error(f"Redis set failed for key {key}: {exc}")
        return False

def redis_get(key: str) -> str | None:
    """Get a value from Redis"""
    client = get_redis_client()
    if client is None:
        return None
    try:
        return client.get(key)
    except RedisError as exc:
        logger.error(f"Redis get failed for key {key}: {exc}")
        return None

def redis_delete(key: str) -> bool:
    """Delete a key from Redis"""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.delete(key))
    except RedisError as exc:
        logger.error(f"Redis delete failed for key {key}: {exc}")
        return False

def redis_publish(channel: str, message: str) -> int:
    """Publish a message to a Redis channel"""
    client = get_redis_client()
    if client is None:
        return 0
    try:
        return client.publish(channel, message)
    except RedisError as exc:
        logger.error(f"Redis publish failed for channel {channel}: {exc}")
        return 0

def get_redis_pubsub():
    """Get a Redis PubSub instance"""
    client = get_redis_client()
    if client is None:
        return None
    try:
        return client.pubsub()
    except RedisError as exc:
        logger.error(f"Failed to get Redis pubsub: {exc}")
        return None

def reset_redis_client() -> None:
    """Reset the singleton client (useful for tests)"""
    global _REDIS_CLIENT
    _REDIS_CLIENT = None


def redis_set_json(key: str, value: any, ex: int | None = None) -> bool:
    """Serialize a value to JSON and set it in Redis"""
    import json
    try:
        return redis_set(key, json.dumps(value), ex=ex)
    except (TypeError, ValueError) as exc:
        logger.error(f"Failed to serialize JSON for key {key}: {exc}")
        return False


def redis_get_json(key: str) -> any | None:
    """Get a value from Redis and deserialize it from JSON"""
    import json
    raw = redis_get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except (TypeError, ValueError) as exc:
        logger.error(f"Failed to deserialize JSON for key {key}: {exc}")
        return None
