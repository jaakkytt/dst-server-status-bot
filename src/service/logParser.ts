import { findSeason, Season, SeasonState } from '../domain/season.js'
import { formatCharacterName, Player } from '../domain/player.js'
import { findPhase, Phase } from '../domain/phase.js'

interface LogEntry {
    state: SeasonState
    phase: Phase
    players: Player[]
}

export class InputEntry {
    public static pattern = /^\[(\d{2}:\d{2}:\d{2})]:\sRemoteCommandInput: "c_dumpseasons\(\); print\("Current phase: " \.\. TheWorld\.components\.worldstate\.data\.phase\); c_listallplayers\(\)"$/
    public timestamp: string

    constructor(match: RegExpMatchArray) {
        this.timestamp = match[1]
    }
}

export class PhaseEntry {
    public static pattern = /^\[(\d{2}:\d{2}:\d{2})]:\sCurrent phase:\s(day|dusk|night)$/
    public timestamp: string
    public phase: Phase

    constructor(match: RegExpMatchArray) {
        this.timestamp = match[1]
        this.phase = findPhase(match[2])
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
        this.season = findSeason(match[3])
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

const sources = [
    InputEntry.pattern.source,
    PhaseEntry.pattern.source,
    SeasonEntry.pattern.source,
    PlayerEntry.pattern.source
]

const combinedPattern = new RegExp(`(${sources.join('|')})`)

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

        if (!timestamp || logEntries.length < 3) {
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

        const phase = logEntries
            .map(entry => {
                const match = entry.match(PhaseEntry.pattern)
                return match ? new PhaseEntry(match).phase : null
            })
            .filter(x => x !== null)
            .pop()

        if (!phase) {
            console.warn('Input command was executed but phase was not matched:', logEntries)
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
            phase: phase,
            players: players,
        }
    },
}
