import { loadPresets } from '../preset'
import { mocked } from 'ts-jest/utils'
import { join } from 'path'

jest.mock('glob', () =>
  jest.fn((glob, opts, cb) => cb(null, ['mock-preset.js']))
)

const fakeExec = {
  stdout: join(__dirname, '../__fake_presets__'),
  stderr: ''
}

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, cb) => cb(null, fakeExec))
}))

describe('#loadPresets', () => {
  it('should query for presets', async () => {
    let results = await loadPresets()

    expect(results).toHaveLength(1)
    expect(results[0].name).toEqual('mock-plugin')
    expect(results[0].version).toEqual('1.2.3')
  })
})
