import prompts from 'prompts'
import semver from 'semver'
import { basename } from 'path'
import { Puggle, PatchStrategy } from '../types'
import { makeConfig, loadConfig } from './config'
import { VConfigFile, VConfigType, VDir } from '../vnodes'
import { stringifyVNode, findFileConflicts, promptsExitProcess } from '../utils'
import { makePluginContext } from './context'

export const puggle: Puggle = {
  async init(preset, targetPath, options = {}) {
    const log = (...args: unknown[]) => {
      if (!options.silent) console.log(...args)
    }

    let { targetName } = await prompts(
      [
        {
          type: 'text',
          name: 'targetName',
          message: 'project name',
          initial: basename(targetPath === '.' ? process.cwd() : targetPath),
        },
      ],
      promptsExitProcess
    )

    const config = makeConfig(preset, targetName)
    const vfs = await puggle.generateVfs(preset, targetName, targetPath, config)
    const conflicts = await findFileConflicts('.', vfs)

    if (conflicts.length > 0) {
      console.log('Cannot proceed with conflicts\n-' + conflicts.join('\n-'))
      process.exit(1)
    }

    if (options.dryRun) return console.log(stringifyVNode(vfs))

    let { confirmed } = await prompts(
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Initialize project into '${targetPath}'?`,
        initial: true,
      },
      promptsExitProcess
    )

    if (!confirmed) process.exit(1)

    await vfs.writeToFile('.')

    log(`Initialized into ${targetName}`)
  },

  async update(targetPath, presets, options = {}) {
    const log = (...args: unknown[]) => {
      if (!options.silent) console.log(...args)
    }

    const oldConfig = loadConfig(targetPath)

    log(
      `Puggle project '${oldConfig.projectName}' found using ${oldConfig.preset.name}@${oldConfig.preset.version}`
    )

    let preset = presets.find((p) => p.name === oldConfig.preset.name)!

    if (preset === undefined) {
      log(`preset '${oldConfig.preset.name}' not found`)
      process.exit(1)
    }

    let newConfig = makeConfig(preset, oldConfig.projectName)
    newConfig.params = oldConfig.params

    const oldVersion = oldConfig.preset.version
    const newVersion = newConfig.preset.version

    if (semver.gte(oldVersion, newVersion)) {
      throw new Error(`No updates available`)
    }

    if (semver.diff(oldVersion, newVersion) === 'major') {
      throw new Error(`Cannot update from '${oldVersion}' to '${newVersion}'`)
    }

    let vfs = await puggle.generateVfs(
      preset,
      oldConfig.projectName,
      targetPath,
      newConfig
    )

    let { confirmed } = await prompts(
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Update '${newConfig.projectName}' to ${newConfig.preset.name}@${newVersion}?`,
      },
      promptsExitProcess
    )

    let puggleJson = vfs.find('puggle.json') as VConfigFile
    if (!puggleJson) throw new Error('puggle.json was removed')

    for (const [key, value] of Object.entries(newConfig)) {
      puggleJson.addPatch(key, PatchStrategy.persist, value)
    }

    if (!confirmed) process.exit(1)

    await vfs.patchFile('.')

    log(`Updated '${newConfig.projectName}'`)
  },

  async generateVfs(preset, targetName, targetPath, config) {
    const root = new VDir(targetPath, [])

    const ctx = makePluginContext(preset, targetName, targetPath, config)

    for (let plugin of preset.plugins) {
      await plugin.apply(root, ctx)
    }

    await preset.apply(root, ctx)

    root.addChild(
      new VConfigFile('puggle.json', VConfigType.json, config, {
        strategy: PatchStrategy.persist,
      })
    )

    return root
  },
}

export const pugglify = (p: Puggle) => p
