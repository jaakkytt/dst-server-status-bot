import { ActivityType, PresenceStatusData } from 'discord.js'
import { SeasonState } from '../domain/season.js'
import { Player } from '../domain/player.js'

export class Presence {

    public afk: boolean
    public status: PresenceStatusData
    public activity: {
		name: string;
		state: string;
		details: string;
		type: ActivityType;
		timestamp: { start: number, end: number }
	}

    constructor(state: SeasonState, players: Player[], activityStart: number, activityEnd: number) {
        const message = `${state.season.icon}${state.season.name} day ${state.currentDay}/${state.totalDays}`
        const suffix = players.length == 0 ? '' : ` 🧍${players.length}`
        this.afk = players.length == 0
        this.status = this.afk ? 'idle' : 'online'

        this.activity = {
            name: 'Don\'t Starve Together',
            type: ActivityType.Custom,
            details: players.map(player => `${player.username}(${player.character})`).join(', '),
            state: `${message}${suffix}`,
            timestamp: {
                start: activityStart,
                end: activityEnd,
            },
        }
    }
}
