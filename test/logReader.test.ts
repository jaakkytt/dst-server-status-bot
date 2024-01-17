import { after, before, describe, it } from 'node:test'
import { EOL, tmpdir } from 'os'
import { join } from 'path'
import { URL } from 'url'
import { appendFile, mkdtemp, rmdir, unlink } from 'node:fs/promises'
import { PathLike } from 'fs'
import * as assert from 'node:assert'
import { LogReader } from '../src/service/logReader.js'

import { timestampPattern, timeout } from './config.js'
let reader: LogReader

describe('on data', { skip: !timestampPattern, timeout: timeout }, () => {
    before(() => {
        reader = new LogReader(
            join(new URL('.', import.meta.url).pathname, '..', 'README.md'),
            timestampPattern,
        )
    })

    it('should split data if multiple entries are found', async () => {
        const message =
			`will ignore this line${EOL}` +
			`[21:49:22]: [Server thread/INFO]: will match${EOL}` +
			` and ignore this${EOL}` +
			`[21:49:22]: [ will match again${EOL}` +
			` [21:49:22]: [Server thread/INFO]: but ignore this${EOL}`
        let actual: string[] = []

        reader.register('.', (logOutput) => {
            actual = actual.concat(logOutput)
        })

        reader.onData(message)

        assert.deepEqual(actual, [
            '[21:49:22]: [Server thread/INFO]: will match',
            '[21:49:22]: [ will match again',
        ])
    })

    it('should pass entry to all matching callbacks', async () => {
        const message = '[21:49:22]: [Server thread/INFO]: <Socrates2100> test content'
        let calls = 0

        reader.register('\\[Server thread\\/INFO]: <', (logOutput) => {
            assert.strictEqual(logOutput[0], message)
            calls++
        })

        reader.register('<Socrates2100>', async (logOutput) => {
            assert.strictEqual(logOutput[0], message)
            calls++
        })

        reader.register('Socrates0000', async () => {
            assert.fail('Should not be called')
        })

        reader.onData(message)

        assert.strictEqual(2, calls)
    })
})

describe('on initialize follow file', { skip: !timestampPattern, timeout: timeout }, () => {
    let tempPath: PathLike
    let tempFile: PathLike

    before(async () => {
        tempPath = await mkdtemp(join(tmpdir(), 'temp-'))
        tempFile = join(tempPath, 'temp.log')

        reader = new LogReader(tempFile, timestampPattern)
    })

    after(async () => {
        await reader.terminate()
        await unlink(tempFile)
        await rmdir(tempPath)
    })

    it('should pass new entries to callback when written to file', async () => {
        let actual: string[] = []

        await appendFile(tempFile, `[07:10:08]: autumn 10 -> 10 days (50 %) cycle${EOL}`)

        await reader.initialize()
        reader.register('autumn', (logOutput) => {
            actual = logOutput
        })

        await appendFile(tempFile, `[07:13:08]: RemoteCommandInput: "c_dumpseasons(); c_listallplayers()"${EOL}`)
        await appendFile(tempFile, `[07:13:08]: autumn 11 -> 9 days (78 %) cycle${EOL}`)
        await appendFile(tempFile, `[07:13:08]: autumn 12 -> 8 days (81 %) cycle${EOL}`)
        await appendFile(tempFile, `[xxx]: autumn 13 -> 7 days (85 %) cycle${EOL}`)
        await appendFile(tempFile, `[07:13:08]: [1] (KU_4DmXZhvB) jaakkytt <wilson>${EOL}`)
        await appendFile(tempFile, `[10:17:17]: Server Autopaused${EOL}`)

        await reader.terminate()

        await appendFile(tempFile, `[10:17:18]: autumn 13 -> 7 days (85 %) cycle${EOL}`)

        setTimeout(() => {
            assert.deepEqual(actual, [
                '[07:13:08]: autumn 11 -> 9 days (78 %) cycle',
                '[07:13:08]: autumn 12 -> 8 days (81 %) cycle',
            ])
        }, 2000)
    })
})
