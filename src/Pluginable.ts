import { VDir } from './VNode'

export type PluginArgs = {
  targetPath: string
  projectName: string
  // previousPluginVersions: { [idx: string]: string | undefined }
}

export interface Pluginable {
  version: string

  extendVirtualFileSystem(root: VDir, args: PluginArgs): Promise<void>
}

export interface Preset extends Pluginable {
  plugins: Pluginable[]
}
