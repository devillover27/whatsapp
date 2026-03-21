import { Queue } from 'bullmq'
import { redisConnection } from '../redis/connection.js'

const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: false,
}

export const campaignQueue = new Queue('campaign-send', {
  connection: redisConnection as any,
  defaultJobOptions,
})

export const webhookQueue = new Queue('webhook-events', {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: { count: 5000 },
  },
})
