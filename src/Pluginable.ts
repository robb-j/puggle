import { VDir } from './VNode'

export type PluginArgs = {
  path: string
  dirname: string
  // previousPluginVersions: { [idx: string]: string | undefined }
}

export interface Pluginable {
  version: string

  extendVirtualFileSystem(root: VDir, args: PluginArgs): Promise<void>
}
