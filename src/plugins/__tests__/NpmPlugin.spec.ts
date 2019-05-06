import { NpmPlugin } from '../NpmPlugin'
import { VDir } from '../../vnodes'
import { PluginArgs, PluginClass } from '../../types'
import { VPackageJson } from '../NpmPlugin'

import prompts from 'prompts'

describe('VPackageJson', () => {
  let pkg: VPackageJson

  beforeEach(() => {
    pkg = new VPackageJson()
  })

  describe('.getPackageOrFail', () => {
    it('should fail if there is no package.json', () => {
      let dir = new VDir('.')
      let exec = () => VPackageJson.getPackageOrFail(dir)
      expect(exec).toThrow('No package.json')
    })
    it('should return the package', () => {
      let dir = new VDir('.', [pkg])
      let result = VPackageJson.getPackageOrFail(dir)
      expect(result).toBe(pkg)
    })
  })
})

describe('NpmPlugin', () => {
  let root: VDir
  let plugin: NpmPlugin
  let args: PluginArgs
  let fakedPlugins = new Set<string>()

  beforeEach(() => {
    root = new VDir('.')
    plugin = new NpmPlugin()

    args = {
      hasPlugin: (c: PluginClass) => fakedPlugins.has(c.name),
      targetPath: '/tmp',
      projectName: 'test_project'
    }

    prompts.inject([
      'test-package',
      'A long test description',
      'robb-j/test-package'
    ])
  })

  describe('#extendVirtualFileSystem', () => {
    it('should setup a package.json from prompts', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      let npmPackage = root.find('package.json') as VPackageJson

      expect(npmPackage).toBeDefined()
      expect(npmPackage.values.name).toBe('test-package')
      expect(npmPackage.values.description).toBe('A long test description')
      expect(npmPackage.values.repository).toBe('robb-j/test-package')
    })
  })
})
