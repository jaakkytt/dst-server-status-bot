import { Presence } from './service/presence.js'
import { LogReader } from './service/logReader.js'
import { Discord } from './service/discord.js'
import { Docker } from './service/docker.js'
import { logParser } from './service/logParser.js'
import { Service } from './service/service.js'

import {
    clusterDirectory,
    containerName,
    discordToken,
    logFile,
    loginTimeout,
    timestampPattern,
    updateFrequency,
} from './config.js'

const reader = new LogReader(logFile, timestampPattern)
const docker = new Docker(containerName, clusterDirectory)
const discord = new Discord(discordToken, loginTimeout)

const services: Service[] = [reader, docker, discord]

const main = async () => {
    for (const service of services) {
        console.debug(`Initializing ${service.constructor.name}`)
        await service.initialize()
    }

    const ready = Date.now()

    setInterval(async () => await docker.sendPrintRequest(), updateFrequency)

    await docker.sendPrintRequest()

    reader.register(logParser.pattern.source, logOutput => {
        const entry = logParser.parse(logOutput)
        if (entry) {
            const end = Date.now() + (updateFrequency * 2)
            discord.setPresence(new Presence(entry.state, entry.phase, entry.players, ready, end))
        }
    })
}

const terminateServices = async () => {
    for (const service of services) {
        console.debug(`Terminating ${service.constructor.name}`)
        await service.terminate().catch(e => {
            console.error(`Failed to terminate ${service.constructor.name}`, e)
        })
    }
}

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Gracefully shutting down...')
    await terminateServices()
    process.exit(0)
})

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Gracefully shutting down...')
    await terminateServices()
    process.exit(0)
})

process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception. Exiting...', error)
    await terminateServices()
    process.exit(1)
})

main().then(() => console.log('Bot started'))
