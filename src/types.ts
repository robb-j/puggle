import { VDir } from './vnodes'
import { Puggle } from './Puggle'

export interface PluginClass {
  new (...args: any[]): Pluginable
}

export type PluginArgs = {
  hasPlugin: (c: PluginClass) => boolean
  targetPath: string
  projectName: string
  puggle: Puggle
}

export interface Pluginable {
  version: string

  extendVirtualFileSystem(root: VDir, args: PluginArgs): Promise<void>
}

export interface Preset extends Pluginable {
  title: string
  plugins: Pluginable[]
}

export type StringOrStringArray = string | string[]

export type StringKeyed<T = any> = { [idx: string]: T }

export type PuggleConfig = {
  version: string
  preset: {
    name: string
    version: string
  }
  plugins: StringKeyed<string>
  params: StringKeyed<any>
}
