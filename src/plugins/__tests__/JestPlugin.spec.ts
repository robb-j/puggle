import { JestPlugin } from '../JestPlugin'
import { VDir } from '../../vnodes'
import { PluginArgs, PluginClass } from '../../types'
import { VPackageJson } from '../NpmPlugin'

describe('JestPlugin', () => {
  let root: VDir
  let plugin: JestPlugin
  let args: PluginArgs
  let pkg: VPackageJson
  let fakedPlugins = new Set<string>()

  beforeEach(() => {
    pkg = new VPackageJson()
    root = new VDir('.', [pkg])
    plugin = new JestPlugin()

    args = {
      hasPlugin: (c: PluginClass) => fakedPlugins.has(c.name),
      targetPath: '/tmp',
      projectName: 'test_project'
    }
  })

  describe('#extendVirtualFileSystem', () => {
    it('should add devDependencies', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('jest')
    })

    it('should add scripts', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.scripts).toHaveProperty('test')
      expect(pkg.scripts).toHaveProperty('coverage')
    })

    it('should add extra devDependencies for TypeScript', async () => {
      fakedPlugins.add('TypeScriptPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('ts-jest')
      expect(pkg.devDependencies).toHaveProperty('@types/jest')
    })

    it('should add TypeScript configuration', async () => {
      fakedPlugins.add('TypeScriptPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.values).toHaveProperty('jest')
    })
  })
})
