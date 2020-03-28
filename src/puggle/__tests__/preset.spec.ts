import { loadPresets } from '../preset'
import { mocked } from 'ts-jest/utils'
import { join } from 'path'

jest.mock('glob', () =>
  jest.fn((glob, opts, cb) =>
    cb(null, ['mock-preset.js', 'mock-preset-list.js'])
  )
)

const fakeExec = {
  stdout: join(__dirname, '../__fake_presets__'),
  stderr: '',
}

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, cb) => cb(null, fakeExec)),
}))

describe('#loadPresets', () => {
  it('should query for presets', async () => {
    let results = await loadPresets()

    expect(results).toContainEqual({
      name: 'mock-preset',
      version: '1.2.3',
      apply: expect.any(Function),
    })
  })
  it('should process preset arrays', async () => {
    let results = await loadPresets()

    expect(results).toContainEqual({
      name: 'list-preset-a',
      version: '1.2.3',
      apply: expect.any(Function),
    })
    expect(results).toContainEqual({
      name: 'list-preset-b',
      version: '1.2.3',
      apply: expect.any(Function),
    })
  })
})
