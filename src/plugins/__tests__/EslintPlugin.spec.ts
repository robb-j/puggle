import { EslintPlugin } from '../EslintPlugin'
import { VDir, VConfigFile } from '../../vnodes'
import { PluginArgs, PluginClass } from '../../types'
import { VPackageJson } from '../NpmPlugin'

describe('EslintPlugin', () => {
  let root: VDir
  let plugin: EslintPlugin
  let args: PluginArgs
  let pkg: VPackageJson
  let fakedPlugins = new Set<string>()

  beforeEach(() => {
    pkg = new VPackageJson()
    root = new VDir('.', [pkg])
    plugin = new EslintPlugin()

    args = {
      hasPlugin: (c: PluginClass) => fakedPlugins.has(c.name),
      targetPath: '/tmp',
      projectName: 'test_project',
      puggle: {} as any
    }
  })

  describe('#extendVirtualFileSystem', () => {
    it('should add dependencies', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('eslint')
      expect(pkg.devDependencies).toHaveProperty('eslint-config-standard')
      expect(pkg.devDependencies).toHaveProperty('eslint-plugin-import')
      expect(pkg.devDependencies).toHaveProperty('eslint-plugin-node')
      expect(pkg.devDependencies).toHaveProperty('eslint-plugin-promise')
      expect(pkg.devDependencies).toHaveProperty('eslint-plugin-standard')
    })

    it('should add a .eslintrc.yml config', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(root.find('.eslintrc.yml')).toBeDefined()
    })

    it('should add prettier dependencies', async () => {
      fakedPlugins.add('PrettierPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.devDependencies).toHaveProperty('eslint-config-prettier')
    })

    it('should add prettier config', async () => {
      fakedPlugins.add('PrettierPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      let config = root.find('.eslintrc.yml') as VConfigFile

      expect(config.values.extends).toContain('prettier')
      expect(config.values.extends).toContain('prettier/standard')
    })

    it('should add jest the global', async () => {
      fakedPlugins.add('JestPlugin')

      await plugin.extendVirtualFileSystem(root, args)

      let config = root.find('.eslintrc.yml') as VConfigFile

      expect(config.values.env).toHaveProperty('jest', true)
    })

    it('should add a lint script', async () => {
      await plugin.extendVirtualFileSystem(root, args)

      expect(pkg.scripts).toHaveProperty('lint')
    })
  })
})
