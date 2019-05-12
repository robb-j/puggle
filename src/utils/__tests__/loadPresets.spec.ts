import { loadPresets } from '../loadPresets'
import { mocked } from 'ts-jest/utils'
import { glob, exec } from '../promisified'
import { join } from 'path'

const mockedGlob = mocked(glob, false)
const mockedExec = mocked(exec, false)

jest.mock('../promisified')

describe('#loadPresets', () => {
  beforeEach(() => {
    mockedExec.mockReturnValue(
      Promise.resolve({
        stdout: join(__dirname, '../__mocks__'),
        stderr: ''
      })
    )

    mockedGlob.mockReturnValue(Promise.resolve(['MockPlugin.js']))
  })

  it('should query for presets', async () => {
    let results = await loadPresets()

    expect(results).toHaveLength(1)
    expect(results[0].title).toEqual('mock:plugin')
  })
})
