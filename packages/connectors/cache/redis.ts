import Redis from "ioredis"

export const redis = new Redis({
  host: "localhost",
  port: 6379
})

export async function getCache(key: string) {

  const data = await redis.get(key)

  if (!data) return null

  return JSON.parse(data)

}

export async function setCache(
  key: string,
  value: any,
  ttl = 3600
) {

  await redis.set(
    key,
    JSON.stringify(value),
    "EX",
    ttl
  )

}
