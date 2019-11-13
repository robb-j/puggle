import { VFile } from '../vfile'

import { writeFile } from 'fs-extra'
import { PatchStrategy } from '../../types'

jest.mock('fs-extra')

describe('VFile', () => {
  describe('#constructor', () => {
    it('should store the contents and strategy', () => {
      let file = new VFile('file', 'hello world', PatchStrategy.placeholder)
      expect(file.contents).toBe('hello world')
      expect(file.strategy).toBe(PatchStrategy.placeholder)
    })
  })

  describe('#prepareContents', () => {
    it('should just return the contents', () => {
      let file = new VFile('file', 'hello world')
      expect(file.prepareContents()).toBe('hello world')
    })
  })

  describe('#writeToFile', () => {
    it('should write the file to that path', async () => {
      let file = new VFile('file', 'hello world')

      await file.writeToFile('root')

      expect(writeFile).toBeCalledWith('root/file', 'hello world')
    })
  })
})
