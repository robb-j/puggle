import { VFile } from '../VFile'

import { writeFile } from '../../utils'

jest.mock('../../utils/promisified')

describe('VFile', () => {
  describe('#constructor', () => {
    it('should store the contents', () => {
      let file = new VFile('file', 'hello world')
      expect(file.contents).toBe('hello world')
    })
  })

  describe('#prepareContents', () => {
    it('should just return the contents', () => {
      let file = new VFile('file', 'hello world')
      expect(file.prepareContents()).toBe('hello world')
    })
  })

  describe('#serialize', () => {
    it('should write the file to that path', async () => {
      let file = new VFile('file', 'hello world')

      await file.serialize('root')

      expect(writeFile).toBeCalledWith('root/file', 'hello world')
    })
  })
})
