import { VConfigFile, VConfigType } from '../VConfigFile'
import Yaml from 'yaml'

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

  describe('#constructor', () => {
    it('should store the type, values and options', () => {
      expect(config.name).toBe('config')
      expect(config.type).toBe(VConfigType.json)
      expect(config.values).toEqual({ name: 'geoff' })
      expect(config.comment).toBe('hello')
    })
  })

  describe('#prepareContents', () => {
    it('should serialize json', () => {
      let data = config.prepareContents()
      expect(data).toEqual(JSON.stringify({ name: 'geoff' }, null, 2))
    })
    it('should serialize yaml', () => {
      config.type = VConfigType.yaml

      let data = config.prepareContents()
      let parsed = Yaml.parse(data)

      expect(parsed).toHaveProperty('name', 'geoff')
    })
    it('should inject a yaml comment', () => {
      config.type = VConfigType.yaml
      let data = config.prepareContents()

      expect(data).toMatch(/^# hello$/m)
    })
  })
})
