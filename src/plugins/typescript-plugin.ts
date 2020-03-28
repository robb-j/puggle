import { VConfigFile, VConfigType, VPackageJson } from '../vnodes'
import { Plugin, PatchStrategy } from '../types'

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
    skipLibCheck: true,
  },
  include: ['src'],
  exclude: ['node_modules'],
}

export const typescriptPlugin: Plugin = {
  name: 'typescript',
  version: '0.2.0',

  async apply(root, { hasPlugin }) {
    let npmPackage = VPackageJson.getOrFail(root)

    await npmPackage.addLatestDevDependencies({
      typescript: '^3.4.1',
      'ts-node': '^8.0.3',
      '@types/node': '^11.13.0',
    })

    root.addChild(
      new VConfigFile('tsconfig.json', VConfigType.json, { ...baseTsconfig })
    )

    npmPackage.addPatch('scripts.build', PatchStrategy.persist, 'tsc')
    npmPackage.addPatch('scripts.lint', PatchStrategy.persist, 'tsc --noEmit')
  },
}
