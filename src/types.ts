import { VDir } from './vnodes'

export interface PluginClass {
  new (...args: any[]): Pluginable
}

export type PluginArgs = {
  hasPlugin: (c: PluginClass) => boolean
  targetPath: string
  projectName: string
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
