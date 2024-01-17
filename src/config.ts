import { config } from 'dotenv'

config()

export const logFile = process.env.LOG_FILE || '/data/DoNotStarveTogether/Cluster_1/Master/server_log.txt'
export const timestampPattern = process.env.TIMESTAMP_PATTERN || '\\[\\d{2}:\\d{2}:\\d{2}\\]:'

export const clusterDirectory = process.env.DST_CLUSTER_DIR || '/data/DoNotStarveTogether/Cluster_1/'
export const containerName = process.env.DST_CONTAINER_NAME || 'dst'

export const discordToken = process.env.DISCORD_TOKEN || ''
export const loginTimeout = parseInt(process.env.DISCORD_LOGIN_TIMEOUT || '60000')

export const updateFrequency = parseInt(process.env.UPDATE_FREQUENCY || '30000')
