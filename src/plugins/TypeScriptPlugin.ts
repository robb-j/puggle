import { VDir, VConfigFile, VConfigType } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'
import { VPackageJson } from './NpmPlugin'

const baseTsconfig = {
  compilerOptions: {
    outDir: 'dist',
    target: 'es2018',
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    sourceMap: true,
    declaration: true,
    pretty: true,
    newLine: 'lf',
    stripInternal: true,
    strict: true,
    noImplicitReturns: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noFallthroughCasesInSwitch: true,
    noEmitOnError: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true
  },
  include: ['src'],
  exclude: ['node_modules']
}

export class TypeScriptPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, args: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    npmPackage.devDependencies['typescript'] = '^3.4.1'
    npmPackage.devDependencies['ts-node'] = '^8.0.3'
    npmPackage.devDependencies['@types/node'] = '^11.13.0'

    root.addChild(
      new VConfigFile('tsconfig.json', VConfigType.json, { ...baseTsconfig })
    )

    npmPackage.scripts['build'] = 'tsc'
    npmPackage.scripts['lint'] = 'tsc --noEmit'
  }
}
