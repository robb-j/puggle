import { VIgnoreFile } from '../vignore-file'
import { PatchStrategy } from '../../types'

import { readFile, writeFile } from 'fs-extra'

jest.mock('fs-extra')

const fakeIgnore = `
#
# Info B
#
.cache
dist
`

describe('VIgnoreFile', () => {
  describe('#constructor', () => {
    it('should store the description and rules', () => {
      let ignore = new VIgnoreFile(
        'ignore',
        'hello',
        ['dist'],
        PatchStrategy.placeholder
      )

      expect(ignore.description).toBe('hello')
      expect(ignore.rules).toContain('dist')
      expect(ignore.strategy).toEqual(PatchStrategy.placeholder)
    })
  })

  describe('.render', () => {
    it('should render the ignore file', () => {
      const result = VIgnoreFile.render('some info', ['node_modules', 'dist'])

      expect(result).toMatch(/^# some info$/m)
      expect(result).toMatch(/^node_modules$/m)
      expect(result).toMatch(/^dist$/m)
    })
  })

  describe('.readRules', () => {
    it('should return the ignore rules in the file', () => {
      let result = VIgnoreFile.readRules(fakeIgnore)

      expect(result).toHaveLength(2)
      expect(result).toContain('dist')
      expect(result).toContain('.cache')
    })
  })

  describe('#prepareContents', () => {
    it('should write the rules', () => {
      const ignore = new VIgnoreFile(
        'ignore',
        'some info',
        ['node_modules', 'dist'],
        PatchStrategy.persist
      )

      let result = ignore.prepareContents()

      expect(result).toMatch(/^node_modules$/m)
      expect(result).toMatch(/^dist$/m)
    })

    it('should add the desccription at the top', () => {
      let ignore = new VIgnoreFile('ignore', 'hello', [], PatchStrategy.persist)
      let result = ignore.prepareContents()
      expect(result).toMatch(/^# hello$/m)
    })
  })

  describe('#patchFile', () => {
    it('should read the target file', async () => {
      jest.mocked(readFile).mockResolvedValueOnce(fakeIgnore as any)

      const ignore = new VIgnoreFile(
        '.ignore',
        'some info',
        ['dist'],
        PatchStrategy.persist
      )

      await ignore.patchFile('some/dir')

      expect(readFile).toBeCalledWith('some/dir/.ignore', 'utf8')
    })

    it('should write the patched file', async () => {
      jest.mocked(readFile).mockResolvedValueOnce(fakeIgnore as any)

      const ignore = new VIgnoreFile(
        '.ignore',
        'some info',
        ['node_modules', 'dist'],
        PatchStrategy.persist
      )

      await ignore.patchFile('some/dir')

      expect(writeFile).toBeCalledWith('some/dir/.ignore', expect.any(String))
    })

    it('should merge the ignore files', async () => {
      jest.mocked(readFile).mockResolvedValueOnce(fakeIgnore as any)

      let result = ''
      jest.mocked(writeFile).mockImplementationOnce((path, data) => {
        result = data
      })

      const ignore = new VIgnoreFile(
        '.ignore',
        'some info',
        ['node_modules', 'dist'],
        PatchStrategy.persist
      )

      await ignore.patchFile('some/dir')

      expect(result).toMatch(/^# some info$/m)
      expect(result).toMatch(/^node_modules$/m)
      expect(result).toMatch(/^dist$/m)
      expect(result).toMatch(/^.cache$/m)
    })

    it("should create a new file if it does't exist", async () => {
      jest.mocked(readFile).mockRejectedValueOnce(new Error('not found'))

      const ignore = new VIgnoreFile(
        '.ignore',
        'some info',
        ['dist'],
        PatchStrategy.persist
      )

      await ignore.patchFile('some/dir')

      expect(readFile).toBeCalledWith('some/dir/.ignore', 'utf8')
    })
  })
})
