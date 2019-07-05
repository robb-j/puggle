import { PrettierPlugin } from '../PrettierPlugin'
import { VDir, VIgnoreFile } from '../../vnodes'
import { PluginArgs, PluginClass } from '../../types'
import { VPackageJson } from '../NpmPlugin'

describe('PrettierPlugin', () => {
  let root: VDir
  let plugin: PrettierPlugin
  let args: PluginArgs
  let pkg: VPackageJson
  let fakedPlugins = new Set<string>()

  beforeEach(() => {
    pkg = new VPackageJson()
    root = new VDir('.', [pkg])
    plugin = new PrettierPlugin()

    args = {
      hasPlugin: (c: PluginClass) => fakedPlugins.has(c.name),
      targetPath: '/tmp',
      projectName: 'test_project',
      puggle: {} as any
    }
  })

  describe('#extendVirtualFileSystem', () => {
    it('should add prettier config to the package.json', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.values.prettier).toBeDefined()
    })

    it('should add husky config to the package.json', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.values.husky).toEqual({
        hooks: {
          'pre-commit': 'lint-staged'
        }
      })
    })

    it('should add lint-staged config to the package.json', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.values['lint-staged']).toBeDefined()
    })

    it('should add the devDependencies', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('prettier')
      expect(pkg.devDependencies).toHaveProperty('husky')
      expect(pkg.devDependencies).toHaveProperty('lint-staged')
    })

    it('should add a .prettierignore', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      let ignore = root.find('.prettierignore')

      expect(ignore).toBeInstanceOf(VIgnoreFile)
    })

    it('should ignore `dist` when using TypeScript', async () => {
      fakedPlugins.add('TypeScriptPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      let ignore = root.find('.prettierignore') as VIgnoreFile

      expect(ignore.rules).toContain('dist')
    })
  })
})
