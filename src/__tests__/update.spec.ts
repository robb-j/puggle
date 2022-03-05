//
// Integration test for puggle.update
//

import { testPreset } from '../utils/mock-preset'
import { puggle, makeConfig } from '../puggle'
import { readFileSync, readFile, writeFile } from 'fs-extra'
import yaml from 'yaml'
import { trimInlineTemplate } from '../utils'
import prompts from 'prompts'
import clone from 'lodash.clonedeep'

const testOpts = {
  silent: true,
}

jest.mock('fs-extra')

const mockedFiles = new Map<string, any>()

mockedFiles.set(
  'root/.gitignore',
  trimInlineTemplate`
    #
    # ignore
    #

    .cache
`
)

mockedFiles.set(
  'root/config.json',
  yaml.stringify({
    geoff: {
      name: 'Geoff',
      age: 42,
    },
  })
)

const oldPreset = clone(makeConfig(testPreset, 'project-name'))
oldPreset.preset.version = '1.0.0'

mockedFiles.set('root/puggle.json', JSON.stringify(oldPreset))

const expectedIgnore = trimInlineTemplate`
  #
  # ignore
  #

  dist
  .cache
`

describe('puggle update', () => {
  beforeEach(() => {
    prompts.inject([true])

    jest
      .mocked(readFileSync)
      .mockImplementation((path) => mockedFiles.get(path as any))
    jest
      .mocked(readFile)
      .mockImplementation((path) => mockedFiles.get(path as any))
  })

  afterEach(() => {
    jest.mocked(readFile).mockReset()
  })

  it('should merge persited files', async () => {
    await puggle.update('root', [testPreset], testOpts)

    const expectedYaml =
      '#\n# my config\n#\n\n' +
      yaml.stringify({
        geoff: { name: 'Geoff', age: 42 },
        tim: { name: 'Tim' },
      })
    expect(writeFile).toBeCalledWith('root/config.json', expectedYaml)

    expect(writeFile).toBeCalledWith('root/.gitignore', expectedIgnore)
  })

  it('should not create placeholder files', async () => {
    await puggle.update('root', [testPreset], testOpts)

    expect(writeFile).not.toBeCalledWith(
      'root/src/index.js',
      expect.any(String)
    )
  })

  it('should update the puggle.json', async () => {
    const updatedTestPreset = {
      ...testPreset,
      version: '9.9.9-preset',
    }

    await puggle.update('root', [updatedTestPreset], testOpts)

    expect(writeFile).toBeCalledWith(
      'root/puggle.json',
      expect.stringContaining('9.9.9-preset')
    )
  })
})
