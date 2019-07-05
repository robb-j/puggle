import { NpmPlugin } from '../NpmPlugin'
import { VDir } from '../../vnodes'
import { PluginArgs, PluginClass, Preset } from '../../types'
import { writeFile } from '../../utils/promisified'
import { VPackageJson } from '../NpmPlugin'

import prompts from 'prompts'
import { Puggle } from '../../Puggle'

class MockPreset implements Preset {
  title = 'mock-preset'
  plugins = []
  version = 'v1'
  async extendVirtualFileSystem(root: VDir, args: PluginArgs) {}
}

jest.mock('../../utils/promisified')

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

  describe('#serialize', () => {
    it('should write the package to json', async () => {
      pkg.dependencies['some-module'] = '^1.2.3'
      pkg.devDependencies['some-dev-module'] = '^4.5.6'
      pkg.scripts['start'] = 'echo "Hello, World!"'

      await pkg.serialize('/tmp/package.json')

      let [path, rawData] = (writeFile as any).mock.calls[0]

      let data = JSON.parse(rawData)

      expect(path).toMatch(/package.json$/)

      expect(data.dependencies).toHaveProperty('some-module', '^1.2.3')
      expect(data.devDependencies).toHaveProperty('some-dev-module', '^4.5.6')
      expect(data.scripts).toHaveProperty('start', 'echo "Hello, World!"')
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
      projectName: 'test_project',
      puggle: new Puggle(new MockPreset())
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
