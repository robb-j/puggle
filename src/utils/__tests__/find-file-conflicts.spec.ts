import { readdir } from 'fs-extra'
import { mocked } from 'ts-jest/utils'

import { VDir, VNode } from '../../vnodes'
import { findFileConflicts } from '../find-file-conflicts'

jest.mock('fs-extra')

describe('#findFileConflicts', () => {
  it('should return vnodes that conflict with files', async () => {
    mocked(readdir).mockResolvedValueOnce(['script.js', 'src', 'some.css'])
    mocked(readdir).mockResolvedValueOnce(['index.js'])

    let dir = new VDir('root', [
      new VNode('script.js'),
      new VDir('src', [new VNode('index.js')]),
    ])

    let conflicts = await findFileConflicts('.', dir)

    expect(conflicts).toContain('root/script.js')
    expect(conflicts).toContain('root/src/index.js')
  })
})
