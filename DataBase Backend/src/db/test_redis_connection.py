import redis.asyncio as redis
import asyncio

async def test_redis():
    client = redis.Redis(
        host="redis-13270.c321.us-east-1-2.ec2.redns.redis-cloud.com",
        port=13270,
        password="i9Zge853951I4Q8SaMV2cfhjb1zvDnJ9",
        ssl=True
    )
    try:
        pong = await client.ping()
        print("Redis connection successful:", pong)
    except Exception as e:
        print("Redis connection failed:", e)

asyncio.run(test_redis())