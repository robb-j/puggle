import prompts from 'prompts'
import { Preset, PuggleConfig, PluginContext } from '../types'

const promptOptions = {
  onCancel: () => process.exit(1)
}

export function makePluginContext(
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
