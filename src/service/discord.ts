import { Client, Events, GatewayIntentBits, Partials } from 'discord.js'
import { Presence } from './presence.js'
import { Service } from './service.js'

export class Discord implements Service {

    private readonly token: string
    private readonly loginTimeout: number
    private client: Client
    private initialized = false

    constructor(token: string, loginTimeout: number) {
        this.token = token
        this.loginTimeout = loginTimeout

        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        })
    }

    initialize() {
        if (this.initialized) {
            return Promise.reject(new Error('Discord client is already initialized'))
        }

        const loginPromise = this.client.login(this.token)
            .then(() => {
                if (!this.client.user) {
                    throw new Error('Unable to find bot user')
                }
                this.client.user.setStatus('idle')
                this.client.user.setAFK(true)
            })
            .then(() => {
                return new Promise<void>((resolve) => {
                    this.client.once(Events.ClientReady, async client => {
                        console.log(`Ready! Logged in as ${client.user.tag}`)
                        this.initialized = true
                        return resolve()
                    })
                })
            })

        const timeoutPromise = new Promise<void>((_resolve, reject) => {
            setTimeout(() => reject(new Error('Login timed out')), this.loginTimeout)
        })

        return Promise.race([loginPromise, timeoutPromise])
    }

    terminate() {
        if (!this.initialized || !this.client.user) {
            return Promise.resolve()
        }
        this.client.user.setStatus('dnd')
        console.log(`${this.client.user.tag} logged out`)
        return this.client.destroy()
    }

    setPresence(presence: Presence) {
        if (!this.client.user) {
            throw new Error('Unable to find bot user')
        }
        this.client.user.setAFK(presence.afk)
        this.client.user.setStatus(presence.status)
        return this.client.user.setActivity(presence.activity)
    }
}
