import { Season, SeasonState, getSeasonFrom } from '../domain/season.js'
import { Player, formatCharacterName } from '../domain/player.js'

interface LogEntry {
	state: SeasonState
	players: Player[]
}

export class InputEntry {
    public static pattern = /^\[(\d{2}:\d{2}:\d{2})]:\sRemoteCommandInput: "c_dumpseasons\(\); c_listallplayers\(\)"$/
    public timestamp: string
    constructor(match: RegExpMatchArray) {
        this.timestamp = match[1]
    }
}

export class SeasonEntry implements SeasonState {
    public static pattern = /^\[(\d{2}:\d{2}:\d{2})]:\s((spring|summer|autumn|winter)\s(\d+) -> (\d+) days \((\d+)\s*%\) cycle)$/
    public timestamp: string
    public season: Season
    public currentDay: number
    public totalDays: number
    public cyclePercentage: number

    constructor(match: RegExpMatchArray) {
        this.timestamp = match[1]
        this.season = getSeasonFrom(match[3])
        this.currentDay = parseInt(match[4]) + 1
        this.totalDays = parseInt(match[4]) + parseInt(match[5])
        this.cyclePercentage = parseInt(match[6])
    }
}

export class PlayerEntry implements Player {
    public static pattern = /^\[(\d{2}:\d{2}:\d{2})]: \[\d+] \([^)]+\) (\S+) <([^>]+)>$/
    public timestamp: string
    public username: string
    public character: string

    constructor(match: RegExpMatchArray) {
        this.timestamp = match[1]
        this.username = match[2]
        this.character = formatCharacterName(match[3])
    }
}

const combinedPattern = new RegExp(`(${InputEntry.pattern.source}|${SeasonEntry.pattern.source}|${PlayerEntry.pattern.source})`)

export const logParser = {
    pattern: combinedPattern,
    parse: (logEntries: string[]): LogEntry | null => {
        const timestamp = logEntries
            .map(entry => {
                const match = entry.match(InputEntry.pattern)
                return match ? new InputEntry(match).timestamp : null
            })
            .filter(x => x !== null)
            .pop()

        if (!timestamp || logEntries.length < 2) {
            console.warn('Matched entries without input command:', logEntries)
            return null
        }

        logEntries = logEntries.filter(entry => entry.startsWith(`[${timestamp}]`))

        const season = logEntries
            .map(entry => {
                const match = entry.match(SeasonEntry.pattern)
                return match ? new SeasonEntry(match) : null
            })
            .filter(x => x !== null)
            .pop()

        if (!season) {
            console.warn('Input command was executed but season was not matched:', logEntries)
            return null
        }

        const players = logEntries
            .map(entry => {
                const match = entry.match(PlayerEntry.pattern)
                return match ? new PlayerEntry(match) : null
            })
            .filter(x => x !== null)
            .filter((x): x is PlayerEntry => x !== null)

        return {
            state: season,
            players: players,
        }
    },
}
