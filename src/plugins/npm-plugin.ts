import { VDir, VConfigFile, VConfigType, VPackageJson } from '../vnodes'
import { Plugin, PatchStrategy } from '../types'

export const npmPlugin: Plugin = {
  name: 'npm',
  version: '0.1.0',

  async apply(root, { targetName, askQuestions }) {
    let { packageName, packageInfo, repository } = await askQuestions('npm', [
      {
        type: 'text',
        name: 'packageName',
        message: 'package name',
        initial: targetName,
      },
      {
        type: 'text',
        name: 'packageInfo',
        message: 'package description',
        initial: '',
      },
      {
        type: 'text',
        name: 'repository',
        message: 'git repository',
        initial: '',
      },
    ])

    let pkg = new VPackageJson()
    pkg.addPatch('name', PatchStrategy.placeholder, packageName)
    pkg.addPatch('description', PatchStrategy.placeholder, packageInfo)
    pkg.addPatch('repository', PatchStrategy.placeholder, repository)

    root.addChild(pkg)
  },
}
