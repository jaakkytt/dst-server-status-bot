import TailFile from '@logdna/tail-file'
import { Service } from './service.js'

interface LogCallback {
	(entries: string[]): void;
}

export class LogReader implements Service {

    private readonly logFile: string
    private readonly callbacks: { [key: string]: LogCallback }
    private readonly pattern: RegExp
    private initialized: boolean
    private timestampPattern: string
    private tailFile: TailFile

    constructor(logFile: string, timestampPattern: string) {
        this.logFile = logFile
        this.callbacks = {}
        this.timestampPattern = timestampPattern
        this.pattern = new RegExp(`^${timestampPattern} (.+)$`, 'gm')
        this.initialized = false

        this.tailFile = new TailFile(this.logFile, { encoding: 'utf8' })
            .on('data', (logOutput: string) => this.onData(logOutput))
            .on('tail_error', (error) => {
                console.error('TailFile had an error!', error)
            })
            .on('error', (error) => {
                console.error('A TailFile stream error was likely encountered', error)
                throw error
            })
    }

    initialize() {
        if (this.initialized) {
            return Promise.reject(new Error('Log reader is already initialized'))
        }

        return this.tailFile.start()
            .then(() => {
                console.log(`Found the log file ${this.logFile}, looking for entries starting with: ${this.timestampPattern}`)
                this.initialized = true
            })
            .catch((error) => {
                console.error(`Cannot start. Does the file ${this.logFile} exist?`, error)
                throw error
            })
    }

    terminate() {
        if (!this.initialized) {
            return Promise.resolve()
        }
        this.initialized = false
        return this.tailFile.quit()
    }

    onData(logOutput: string) {
        console.debug('Log entry:', logOutput)
        const logEntries = logOutput.match(this.pattern)
        if (!logEntries) {
            return
        }

        for (const [pattern, callback] of Object.entries(this.callbacks)) {
            const matches = logEntries.map(entry => entry.trim()).filter(entry => entry.match(pattern))
            if (matches.length) {
                callback(matches)
            }
        }
    }

    register(pattern: string, callback: LogCallback) {
        this.callbacks[pattern] = callback
    }
}
