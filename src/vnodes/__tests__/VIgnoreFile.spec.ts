import { VIgnoreFile } from '../VIgnoreFile'

describe('VIgnoreFile', () => {
  describe('#constructor', () => {
    it('should store the description and rules', () => {
      let ignore = new VIgnoreFile('ignore', 'hello', ['dist'])

      expect(ignore.description).toBe('hello')
      expect(ignore.rules).toContain('dist')
    })
  })

  describe('#prepareContents', () => {
    it('should write the rules', () => {
      let ignore = new VIgnoreFile('ignore', 'hello', ['node_modules', 'dist'])

      let result = ignore.prepareContents()

      expect(result).toMatch(/^node_modules$/m)
      expect(result).toMatch(/^dist$/m)
    })

    it('should add the desccription at the top', () => {
      let ignore = new VIgnoreFile('ignore', 'hello', [])
      let result = ignore.prepareContents()
      expect(result).toMatch(/^# hello$/m)
    })
  })
})
