import { join } from 'path'
import { readFileSync } from 'fs'
import { Preset, PuggleConfig } from '../types'

const pkg = require('../package.json')

export function loadConfig(basePath: string): PuggleConfig {
  let path = join(basePath, 'puggle.json')
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function makeConfig(preset: Preset, targetName: string): PuggleConfig {
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
