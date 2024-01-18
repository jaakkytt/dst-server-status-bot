import { after, before, describe, it } from 'node:test'
import * as assert from 'node:assert'
import { Discord } from '../src/service/discord.js'
import { Presence } from '../src/service/presence.js'

import { timeout, token, updateFrequency } from './config.js'
import { Player } from '../src/domain/player.js'
import { Season } from '../src/domain/season.js'
import { Phase } from '../src/domain/phase.js'

let discord: Discord

describe('integration', { skip: !token, timeout: timeout }, () => {
    before(async () => {
        discord = new Discord(token, 60000)
        await discord.initialize().catch((error) => {
            console.error(error)
            assert.fail('Failed to initialize discord')
        })
    })

    after(async () => await discord.terminate())

    it('should set presence', async () => {
        const season = { season: Season.Spring, currentDay: 5, totalDays: 11 }
        const players: Player[] = [{ username: 'player_name', character: 'Wilson' }]
        const presence = new Presence(season, Phase.Night, players, Date.now(), Date.now() + updateFrequency)

        const clientPresence = discord.setPresence(presence)

        assert.equal(clientPresence.status, 'online')
        assert.equal(clientPresence.activities[0].state, '🌸Spring 🌙Night 5/11 🧍1')
    })
})
