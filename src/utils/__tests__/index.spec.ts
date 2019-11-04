import { lastDirectory, trimSlashes, sortObjectKeys } from '../index'

describe('#lastDirectory', () => {
  it('should return the last directory', () => {
    let result = lastDirectory('root/directory/file.txt')
    expect(result).toBe('file.txt')
  })
})

describe('#removeSurroundingSlashes', () => {
  it('should remove slashes', () => {
    let result = trimSlashes('/test_message/')
    expect(result).toBe('test_message')
  })
})

describe('#sortObjectKeys', () => {
  it('should sort keys', () => {
    let result = sortObjectKeys({ z: 1, a: 2 })

    expect(Object.keys(result)).toEqual(['a', 'z'])
  })
})
