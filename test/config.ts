import { config } from 'dotenv'
import { join } from 'path'
import { URL } from 'url'

config({ path: join(new URL('.', import.meta.url).pathname, '.env') })

export const token = process.env.DISCORD_TOKEN || ''
export const timestampPattern = process.env.TIMESTAMP_PATTERN || '\\[\\d{2}:\\d{2}:\\d{2}\\]:'
export const updateFrequency = parseInt(process.env.UPDATE_FREQUENCY || '30000')
export const timeout = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : undefined
