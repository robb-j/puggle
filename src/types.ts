import { VDir } from './vnodes'
import prompts from 'prompts'

export interface Class<T, U extends any[] = any[]> {
  new (...args: U): T
}

export interface PuggleOptions {
  dryRun?: boolean
}

export enum PatchStrategy {
  persist,
  placeholder
}

export interface PluginContext {
  targetPath: string
  targetName: string
  hasPlugin(plugin: string): boolean
  askQuestions<T extends string>(
    namespace: string,
    questions: Array<prompts.PromptObject<T>>
  ): Promise<prompts.Answers<T>>
}

export interface Plugin {
  name: string
  version: string
  apply(root: VDir, context: PluginContext): Promise<void>
}

export interface Preset {
  name: string
  version: string
  plugins: Plugin[]
  apply(root: VDir, context: PluginContext): Promise<void>
}

export type StringOrStringArray = string | string[]

export type StringKeyed<T = any> = { [idx: string]: T }

export type PuggleConfig = {
  version: string
  projectName: string
  preset: {
    name: string
    version: string
  }
  plugins: StringKeyed<string>
  params: StringKeyed<any>
}

export interface Puggle {
  // findPresets(): Promise<Preset[]>

  init(preset: Preset, path: string, options?: PuggleOptions): Promise<void>

  update(
    path: string,
    presets: Preset[],
    options?: PuggleOptions
  ): Promise<void>

  generateVfs(
    preset: Preset,
    name: string,
    path: string,
    config: PuggleConfig
  ): Promise<VDir>
}

export enum VFileType {
  persist,
  placeholder
}
