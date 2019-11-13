import Yaml from 'yaml'

import { VConfigFile, VConfigType, VConfigPatch } from '../vconfig-file'
import { PatchStrategy } from '../../types'

import { readFile, writeFile } from 'fs-extra'
import { mocked } from 'ts-jest/utils'

jest.mock('fs-extra')

const fakeJson = JSON.stringify({
  geoff: {
    name: 'geoff',
    age: 40
  }
})

describe('VConfigFile', () => {
  let config: VConfigFile

  beforeEach(() => {
    config = new VConfigFile(
      'config',
      VConfigType.json,
      { name: 'geoff' },
      { comment: 'hello' }
    )
  })

  describe('.render', () => {
    it('should generate valid yaml files', () => {
      let result = VConfigFile.render(VConfigType.yaml, { name: 'geoff' })

      let parsed = Yaml.parse(result)
      expect(parsed).toEqual({ name: 'geoff' })
    })

    it('should generate valid json files', () => {
      let result = VConfigFile.render(VConfigType.json, { name: 'geoff' })

      let parsed = JSON.parse(result)
      expect(parsed).toEqual({ name: 'geoff' })
    })

    it('should add yaml comments', () => {
      let result = VConfigFile.render(
        VConfigType.yaml,
        { name: 'geoff' },
        'some comment'
      )

      expect(result).toMatch(/^# some comment$/m)
    })
  })

  describe('.applyPatches', () => {
    it('should merge objects', () => {
      const patches = [
        { path: 'geoff', strategy: PatchStrategy.persist, data: { age: 42 } }
      ]
      const values = {
        geoff: {
          name: 'geoff',
          age: 40
        }
      }

      const result = VConfigFile.applyPatches(values, patches)

      expect(result.geoff).toEqual({
        name: 'geoff',
        age: 42
      })
    })
    it('should merge primatives', () => {
      const patches = [
        { path: 'geoff.age', strategy: PatchStrategy.persist, data: 42 }
      ]
      const values = {
        geoff: { age: 30 }
      }

      const result = VConfigFile.applyPatches(values, patches)

      expect(result.geoff).toEqual({ age: 42 })
    })
    it('should add not-set values', () => {
      const patches = [
        {
          path: 'geoff.pets',
          strategy: PatchStrategy.persist,
          data: [{ name: 'bonny', animal: 'dog' }]
        }
      ]
      const values = {
        geoff: {
          name: 'geoff',
          age: 40
        }
      }

      const result = VConfigFile.applyPatches(values, patches)

      expect(result.geoff.pets).toContainEqual({
        name: 'bonny',
        animal: 'dog'
      })
    })
  })

  describe('#constructor', () => {
    it('should store the type, values and options', () => {
      let config = new VConfigFile(
        'config',
        VConfigType.json,
        { name: 'geoff' },
        { comment: 'hello', strategy: PatchStrategy.placeholder }
      )

      expect(config.name).toEqual('config')
      expect(config.type).toEqual(VConfigType.json)
      expect(config.values).toEqual({ name: 'geoff' })
      expect(config.comment).toEqual('hello')
      expect(config.strategy).toEqual(PatchStrategy.placeholder)
      expect(config.patches).toEqual([])
    })
  })

  describe('#addPatch', () => {
    it('should store the patch', () => {
      config.addPatch('some.path', PatchStrategy.placeholder, { some: 'value' })

      expect(config.patches).toContainEqual({
        path: 'some.path',
        strategy: PatchStrategy.placeholder,
        data: { some: 'value' }
      })
    })
  })

  describe('#prepareContents', () => {
    it('should render itself', () => {
      let result = config.prepareContents()
      let parsed = Yaml.parse(result)

      expect(parsed).toEqual({ name: 'geoff' })
    })
  })

  describe('#patchFile', () => {
    it('should read the target file', async () => {
      mocked(readFile).mockResolvedValueOnce(fakeJson as any)

      let config = new VConfigFile('config.json', VConfigType.json, {})

      await config.patchFile('some/dir')

      expect(readFile).toBeCalledWith('some/dir/config.json', 'utf8')
    })
    it('should write the patched file', async () => {
      mocked(readFile).mockResolvedValueOnce(fakeJson as any)

      let config = new VConfigFile('config.json', VConfigType.json, {})

      await config.patchFile('some/dir')

      expect(writeFile).toBeCalledWith(
        'some/dir/config.json',
        expect.any(String)
      )
    })
    it('should merge the files', async () => {
      mocked(readFile).mockResolvedValueOnce(fakeJson as any)

      let writtenFile = ''
      mocked(writeFile).mockImplementationOnce((path, data) => {
        writtenFile = data
      })

      let config = new VConfigFile('config.json', VConfigType.json, {
        geoff: { name: 'geoff' }
      })

      config.addPatch('geoff.age', PatchStrategy.persist, 42)
      config.addPatch('geoff.pets', PatchStrategy.persist, [
        { name: 'bonny', animal: 'dog' }
      ])

      await config.patchFile('some/dir')

      let result = JSON.parse(writtenFile)

      expect(result.geoff).toEqual({
        name: 'geoff',
        age: 42,
        pets: [{ name: 'bonny', animal: 'dog' }]
      })
    })
  })
})
