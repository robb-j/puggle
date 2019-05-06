import { VDir } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'

// .dockerignore
// Dockerfile depending

export class DockerPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, args: PluginArgs) {
    // let tsconfig = root.get('tsconfig.json')
  }
}
