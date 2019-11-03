import {
  VNode,
  VDir,
  findFileConflicts,
  VConfigFile,
  VConfigType
} from './vnodes'
import prompts from 'prompts'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { PuggleConfig } from './types'
import { stringifyVNode } from './utils'

interface PuggleArgs {
  dryRun?: boolean
}

interface PluginContext {
  targetPath: string
  targetName: string
  hasPlugin(plugin: string): boolean
  askQuestions<T extends string>(
    namespace: string,
    questions: Array<prompts.PromptObject<T>>
  ): Promise<prompts.Answers<T>>
}

interface Plugin {
  name: string
  version: string
  apply(root: VDir, context: PluginContext): Promise<void>
}

interface Preset {
  name: string
  version: string
  plugins: Plugin[]
  apply(root: VDir, context: PluginContext): Promise<void>
}

interface Puggle {
  init(preset: Preset, path: string, options?: PuggleArgs): Promise<void>
  update(path: string, presets: Preset[], options?: PuggleArgs): Promise<void>
  generateVfs(
    preset: Preset,
    name: string,
    path: string,
    config: PuggleConfig
  ): Promise<VDir>
}

const pkg = require('../package.json')

const promptOptions = {
  onCancel: () => process.exit(1)
}

function loadConfig(basePath: string): PuggleConfig {
  let path = join(basePath, 'puggle.json')
  return JSON.parse(readFileSync(path, 'utf8'))
}

function makeConfig(preset: Preset, targetName: string): PuggleConfig {
  let plugins: any = {}
  for (let p of preset.plugins) plugins[p.name] = p.version

  return {
    version: pkg.version,
    projectName: targetName,
    preset: {
      name: preset.name,
      version: preset.version
    },
    plugins: plugins,
    params: {}
  }
}

function makePluginContext(
  preset: Preset,
  targetName: string,
  targetPath: string,
  config: PuggleConfig
): PluginContext {
  return {
    targetName,
    targetPath,
    hasPlugin: name => preset.plugins.some(p => p.name === name),
    async askQuestions(ns, qs) {
      let previous = config.params[ns] || {}

      let missing = qs.filter(q => previous[q.name] === undefined)
      let rest = await prompts(missing, promptOptions)

      config.params[ns] = { ...previous, ...rest }

      return config.params[ns]
    }
  }
}

const isVDir = (obj: any) => obj.constructor.name === 'VDir'

type FsPatch = [string, VNode]

function generatePatches(dir: VDir, basePath: string): FsPatch[] {
  const currentPath = join(basePath, dir.name)

  let contents: Set<string>

  const patch = (node: VNode): FsPatch => [join(currentPath, node.name), node]

  try {
    contents = new Set(readdirSync(currentPath))
  } catch (error) {
    contents = new Set()
    // return dir.children.map(child => patch(child))
  }

  let changes = new Array<FsPatch>()

  for (let child of dir.children) {
    if (isVDir(child)) {
      changes.push(...generatePatches(child as VDir, currentPath))
    } else {
      changes.push(patch(child))
    }
  }

  return changes
}

const puggle: Puggle = {
  async init(preset, path, options = {}) {
    let { targetName, targetPath } = await prompts(
      [
        {
          type: 'text',
          name: 'targetName',
          message: 'name'
        },
        {
          type: 'text',
          name: 'targetPath',
          message: 'path',
          initial: '.'
        }
      ],
      promptOptions
    )

    if (targetPath === '.') targetPath = process.cwd()

    const config = makeConfig(preset, targetName)
    const vfs = await puggle.generateVfs(preset, targetName, targetPath, config)
    const conflicts = await findFileConflicts('.', vfs)

    if (conflicts.length > 0) {
      console.log('Cannot proceed with conflics\n-' + conflicts.join('\n-'))
      process.exit(1)
    }

    if (options.dryRun) return console.log(stringifyVNode(vfs))

    await vfs.serialize('.')
    console.log(`Initialized into ${targetName}`)
  },

  async update(targetPath, presets, options = {}) {
    const config = loadConfig(targetPath)

    let preset = presets.find(p => p.name === config.preset.name)!

    if (preset === undefined) {
      console.log(`preset '${config.preset.name}' not found`)
      process.exit(1)
    }

    let newConfig = makeConfig(preset, config.projectName)

    let vfs = await puggle.generateVfs(
      preset,
      config.projectName,
      targetPath,
      newConfig
    )

    await vfs.patchNode('.')
  },

  async generateVfs(preset, targetName, targetPath, config) {
    const root = new VDir(targetPath, [])

    const ctx = makePluginContext(preset, targetName, targetPath, config)

    for (let plugin of preset.plugins) {
      await plugin.apply(root, ctx)
    }

    await preset.apply(root, ctx)

    root.addChild(new VConfigFile('puggle.json', VConfigType.json, config))

    return root
  }
}
