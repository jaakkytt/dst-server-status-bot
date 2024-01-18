import * as fs from 'fs'
import Dockerode from 'dockerode'
import { Service } from './service.js'

const commandFile = 'print.py'

export class Docker implements Service {

    private readonly name: string
    private readonly commandSourcePath: string
    private readonly commandTargetPath: string
    private client: Dockerode | null
    private container: Dockerode.Container | null

    constructor(name: string, commandPath: string) {
        this.name = name
        this.commandSourcePath = `/usr/src/app/${commandFile}`
        this.commandTargetPath = `${commandPath}${commandFile}`
        this.client = null
        this.container = null
    }

    async initialize() {
        if (this.container) {
            return Promise.reject(new Error('Docker is already initialized'))
        }

        this.client = new Dockerode()
        this.container = this.client.getContainer(this.name)

        return this.container
            .inspect()
            .then(info => {
                console.log(`Docker connected to container ID:${info.Id} Name:${info.Name}`)
            })
            .then(() => {
                fs.copyFileSync(this.commandSourcePath, this.commandTargetPath)
                console.log(`Updated DST server command file ${this.commandTargetPath}`)
            })
    }

    async terminate() {
        this.client = null
        this.container = null
        return Promise.resolve()
    }

    async sendPrintRequest() {
        if (!this.container) {
            return Promise.reject(new Error('Docker is not initialized'))
        }

        return this.container
            .exec({ Cmd: ['python', `${this.commandTargetPath}`], Tty: false, AttachStdin: true, AttachStdout: true })
            .then(exec => {
                exec.start({ stdin: true, Tty: true })
                    .then(async () => {
                        console.log(`Docker executed: "python ${this.commandTargetPath}"`)
                    })
                    .catch(reason => {
                        console.warn(`Docker exec.start failed: ${reason}`)
                    })
                return exec
            })
            .catch(reason => {
                console.warn(`Docker exec failed: ${reason}`)
            })
    }
}
