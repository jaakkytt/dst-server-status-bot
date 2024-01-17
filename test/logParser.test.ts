import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { logParser, InputEntry, SeasonEntry, PlayerEntry } from '../src/service/logParser.js'

const validCommandInputEntries = [
    '[02:13:08]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
    '[07:01:00]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
    '[07:13:08]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
    '[18:54:51]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
]

const invalidCommandInputEntries = [
    '[02:     ]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
    '[07:01:00]: RemoteCommandInput: "c_listallplayers()"',
    '[07:13:08]: "c_dumpseasons(); c_listallplayers()"',
    '[18:54:51]: RemoteCommandInput: "c_dumpseasons();"',
]

const validSeasonEntries = [
    '[07:13:08]: autumn 1 -> 20 days (1 %) cycle',
    '[02:13:08]: winter 11 -> 9 days (100%) cycle',
    '[07:13:08]: spring 11 -> 9 days (78 %) cycle',
    '[18:54:51]: autumn 3 -> 7 days (78 %) cycle',
    '[07:13:08]: summer 1 -> 12 days (78%) cycle',
    '[07:01:00]: autumn 12 -> 8 days (7%) cycle',
    '[07:01:00]: winter 12 -> 50 days (5   %) cycle',
]

const invalidSeasonEntries = [
    '[07:13:  ]: autumn 1 -> 20 days (1 %) cycle',
    '[02:08]: winter 11 -> 9 days (100%) cycle',
    '[07:13:08] spring 11 -> 9 days (78 %) cycle',
    '[18:54:51]: holiday 3 -> 7 days (78 %) cycle',
    '[07:13:08]: summer -1 -> 12days (78%) cycle',
    '[07:01:00]: autumn 12 -> 8 days (7) cycle',
    '[07:01:00]: winter 12 -> 50 days 5   %) cycle',
    '[07:01:00]: winter 12 -> 50 days (5A%) cycle',
    '[07:01:00]: winter 12 -> days (5 %) cycle',
]

const validPlayerEntries = [
    '[02:13:08]: [1] (KU_4DmXZhvB) here <wilson>',
    '[07:13:08]: [9] (any) any <wanda>',
    '[07:13:08]: [11] (except ending) without-space <willow>',
    '[18:54:51]: [12] (with a) player-steam-username <wx-78>',
    '[07:13:08]: [44] (closing) player_steam_username <maxwell>',
    '[07:01:00]: [129] (bracket) player.steam.username <wes>',
]

const invalidPlayerEntries = [
    '[02d:13:8]: [1] (KU_4DmXZhvB) here <wilson>',
    '[02:13:08]: (KU_4DmXZhvB) here <wilson>',
    '[07:13:08]: [9 ] (any) any <wanda>',
    '[07:13:08]: [9] any) any <wanda>',
    '[07:13:08] [11] (except ending) without-space <willow>',
    '[07:13:08]: [11] (except) ending) without-space <willow>',
    '[18:54:51]: [12] (with a) player steam username <wx-78>',
    '[07:01:00]: [129] (bracket) player.steam.username',
]

describe('combined pattern', () => {

    it('matches valid input entries', async () => {
        const validEntries = validCommandInputEntries.concat(validSeasonEntries).concat(validPlayerEntries)
        for (const entry of validEntries) {
            assert.strictEqual(logParser.pattern.test(entry), true, `should have matched: ${entry}`)
        }
    })

    it('does not match invalid input entries', async () => {
        const invalidEntries = invalidCommandInputEntries.concat(invalidSeasonEntries).concat(invalidPlayerEntries)
        for (const entry of invalidEntries) {
            assert.strictEqual(logParser.pattern.test(entry), false, `should have not matched: ${entry}`)
        }
    })
})

describe('individual pattern', () => {

    it('matches valid input entries', async () => {
        for (const entry of validCommandInputEntries) {
            assert.strictEqual(InputEntry.pattern.test(entry), true, `should have matched: ${entry}`)
        }
        for (const entry of invalidCommandInputEntries) {
            assert.strictEqual(InputEntry.pattern.test(entry), false, `should have not matched: ${entry}`)
        }
    })

    it('matches valid season entries', async () => {
        for (const entry of validSeasonEntries) {
            assert.strictEqual(SeasonEntry.pattern.test(entry), true, `should have matched: ${entry}`)
        }
        for (const entry of invalidSeasonEntries) {
            assert.strictEqual(SeasonEntry.pattern.test(entry), false, `should have not matched: ${entry}`)
        }
    })

    it('matches valid player entries', async () => {
        for (const entry of validPlayerEntries) {
            assert.strictEqual(PlayerEntry.pattern.test(entry), true, `should have matched: ${entry}`)
        }
        for (const entry of invalidPlayerEntries) {
            assert.strictEqual(PlayerEntry.pattern.test(entry), false, `should have not matched: ${entry}`)
        }
    })
})

describe('input entry', () => {
    it('extracts timestamp', async () => {
        const given = [
            '[02:13:08]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
            '[07:01:00]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
            '[07:13:08]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
            '[18:54:51]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
        ]

        const expected = [
            '02:13:08',
            '07:01:00',
            '07:13:08',
            '18:54:51',
        ]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(InputEntry.pattern) ?? assert.fail(`InputEntry did not match ${given[i]}`)
            const actual = new InputEntry(match).timestamp
            assert.strictEqual(actual, expected[i])
        }
    })
})

describe('season entry', () => {
    it('extracts month', async () => {
        const given = [
            '[07:13:08]: autumn 1 -> 20 days (1 %) cycle',
            '[02:13:08]: winter 11 -> 9 days (100%) cycle',
            '[07:13:08]: spring 11 -> 9 days (78 %) cycle',
            '[07:13:08]: summer 1 -> 12 days (78%) cycle',
        ]

        const expected = [
            'Autumn',
            'Winter',
            'Spring',
            'Summer',
        ]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(SeasonEntry.pattern) ?? assert.fail(`SeasonEntry did not match ${given[i]}`)
            const actual = new SeasonEntry(match).season.name
            assert.strictEqual(actual, expected[i])
        }
    })

    it('extracts day range', async () => {
        const given = [
            '[07:13:08]: autumn 1 -> 20 days (1 %) cycle',
            '[02:13:08]: winter 11 -> 9 days (100%) cycle',
            '[07:13:08]: summer 18 -> 12 days (78%) cycle',
        ]

        const expected = [
            [2, 21],
            [12, 20],
            [19, 30],
        ]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(SeasonEntry.pattern) ?? assert.fail(`SeasonEntry did not match ${given[i]}`)
            const season = new SeasonEntry(match)
            const actual = [season.currentDay, season.totalDays]
            assert.deepStrictEqual(actual, expected[i])
        }
    })

    it('extracts cycle percentage', async () => {
        const given = [
            '[07:13:08]: autumn 1 -> 20 days (1  %) cycle',
            '[07:13:08]: autumn 1 -> 20 days (5  %) cycle',
            '[02:13:08]: winter 11 -> 9 days (100%) cycle',
            '[07:13:08]: spring 11 -> 9 days (78 %) cycle',
            '[07:13:08]: summer 1 -> 12 days (48%) cycle',
        ]

        const expected = [1, 5, 100, 78, 48]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(SeasonEntry.pattern) ?? assert.fail(`SeasonEntry did not match ${given[i]}`)
            const actual = new SeasonEntry(match).cyclePercentage
            assert.strictEqual(actual, expected[i])
        }
    })
})

describe('player entry', () => {
    it('extracts username', async () => {
        const given = [
            '[02:13:08]: [1] (KU_4DmXZhvB) here <wilson>',
            '[07:13:08]: [9] (any) any <wanda>',
            '[07:13:08]: [11] (except ending) without-space <willow>',
            '[18:54:51]: [12] (with a) player-steam-username <wx-78>',
            '[07:13:08]: [44] (closing) player_steam_username <maxwell>',
            '[07:01:00]: [129] (bracket) player.steam.username <wes>',
        ]

        const expected = [
            'here',
            'any',
            'without-space',
            'player-steam-username',
            'player_steam_username',
            'player.steam.username',
        ]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(PlayerEntry.pattern) ?? assert.fail(`PlayerEntry did not match ${given[i]}`)
            const actual = new PlayerEntry(match).username
            assert.strictEqual(actual, expected[i])
        }
    })

    it('extracts character name', async () => {
        const given = [
            '[02:13:08]: [1] (KU_4DmXZhvB) here <wilson>',
            '[07:13:08]: [9] (any) any <wanda>',
            '[07:13:08]: [11] (except ending) without-space <willow>',
            '[18:54:51]: [12] (with a) player-steam-username <wx-78>',
            '[07:13:08]: [44] (closing) player_steam_username <maxwell>',
            '[07:01:00]: [129] (bracket) player.steam.username <wes>',
        ]

        const expected = [
            'Wilson',
            'Wanda',
            'Willow',
            'WX-78',
            'Maxwell',
            'Wes',
        ]

        for (let i = 0; i < given.length; i++) {
            const match = given[i].match(PlayerEntry.pattern) ?? assert.fail(`PlayerEntry did not match ${given[i]}`)
            const actual = new PlayerEntry(match).character
            assert.strictEqual(actual, expected[i])
        }
    })
})

describe('parse', () => {
    it('includes players', async () => {
        const given = [
            '[22:20:39]: [Leave Announcement] player-name',
            '[22:20:39]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"',
            '[22:20:39]: spring 3 -> 17 days (15 %) cycle',
            '[22:20:39]: [1] (KU_4DmXZhvB) player-name <wilson>',
            '[22:20:39]: Serializing user: session/B7A672E4489A411D/A7GGRGGOTFIB/0000000042',
            '[22:20:39]: [2] (KU_443XZhvB) second-player <maxwell>',
            '[22:20:40]: Sim paused',
        ]

        const actual = logParser.parse(given) ?? assert.fail('parse have been able to parse entry')

        assert.strictEqual(actual.state.season.name, 'Spring')
        assert.strictEqual(actual.state.currentDay, 4)
        assert.strictEqual(actual.state.totalDays, 20)
        assert.strictEqual(actual.players.length, 2)
        assert.strictEqual(actual.players[0].username, 'player-name')
        assert.strictEqual(actual.players[0].character, 'Wilson')
        assert.strictEqual(actual.players[1].username, 'second-player')
        assert.strictEqual(actual.players[1].character, 'Maxwell')
    })
})
