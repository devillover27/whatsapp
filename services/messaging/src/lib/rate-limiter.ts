import { redisConnection } from '../redis/connection.js'

const RATE = Number(process.env.RATE_LIMIT_PER_SEC) || 1000
const REFILL_INTERVAL_MS = 1000

const ACQUIRE_SCRIPT = `
local key        = KEYS[1]
local now        = tonumber(ARGV[1])
local rate       = tonumber(ARGV[2])
local interval   = tonumber(ARGV[3])

local bucket     = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens     = tonumber(bucket[1]) or rate
local last       = tonumber(bucket[2]) or now

local elapsed    = now - last
if elapsed >= interval then
  tokens         = rate
  last           = now
end

if tokens > 0 then
  tokens         = tokens - 1
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last)
  redis.call('PEXPIRE', key, interval * 2)
  return 1
else
  return 0
end
`

export async function acquireToken(phoneNumberId: string): Promise<void> {
  const key = `rate:${phoneNumberId}`

  while (true) {
    const result = await redisConnection.eval(
      ACQUIRE_SCRIPT,
      1,
      key,
      Date.now(),
      RATE,
      REFILL_INTERVAL_MS
    ) as number

    if (result === 1) return

    await new Promise(resolve => setTimeout(resolve, 10))
  }
}
