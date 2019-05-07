import { TypeScriptPlugin } from '../TypeScriptPlugin'
import { VDir } from '../../vnodes'
import { PluginArgs, PluginClass } from '../../types'
import { VPackageJson } from '../NpmPlugin'

describe('TypeScriptPlugin', () => {
  let root: VDir
  let plugin: TypeScriptPlugin
  let args: PluginArgs
  let pkg: VPackageJson
  let fakedPlugins = new Set<string>()

  beforeEach(() => {
    pkg = new VPackageJson()
    root = new VDir('.', [pkg])
    plugin = new TypeScriptPlugin()

    args = {
      hasPlugin: (c: PluginClass) => fakedPlugins.has(c.name),
      targetPath: '/tmp',
      projectName: 'test_project'
    }
  })

  describe('#extendVirtualFileSystem', () => {
    it('should add devDependencies', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('typescript')
      expect(pkg.devDependencies).toHaveProperty('ts-node')
      expect(pkg.devDependencies).toHaveProperty('@types/node')
    })

    it('should add a tsconfig.json', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      let tsconfig = root.find('tsconfig.json')

      expect(tsconfig).toBeDefined()
    })

    it('should add scripts', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.scripts).toHaveProperty('build')
      expect(pkg.scripts).toHaveProperty('lint')
    })
  })
})
