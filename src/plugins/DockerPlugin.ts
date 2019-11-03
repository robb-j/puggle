import { VDir, VIgnoreFile, VFile } from '../vnodes'
import { Pluginable, PluginArgs, PatchMode } from '../types'
import { trimInlineTemplate } from '../utils'
import { TypeScriptPlugin } from './TypeScriptPlugin'
import { NpmPlugin } from './NpmPlugin'
import { JestPlugin } from './JestPlugin'

// .dockerignore
// Dockerfile depending

const jsDockerfile = trimInlineTemplate`
  # Use a node alpine image install packages and run the start script
  FROM node:12-alpine
  WORKDIR /app
  EXPOSE 3000
  ENV NODE_ENV production
  COPY ["package*.json", "/app/"]
  RUN npm ci &> /dev/null
  COPY ["src", "/app/src"]
  CMD [ "npm", "start", "-s" ]
`

const tsDockerfile = trimInlineTemplate`
  # [0] A common base for both stages
  FROM node:12-alpine as base
  WORKDIR /app
  COPY ["package*.json", "tsconfig.json", "/app/"]

  # [1] A builder to install dependencies and run a build
  FROM base as builder
  ENV NODE_ENV development
  RUN npm ci &> /dev/null
  COPY ["src", "/app/src"]
  RUN npm run build -s

  # [2] Start from the base again, install production dependencies,
  # copy the dist folder from the builder stage and setup the CLI as the command
  FROM base as dist
  ENV NODE_ENV production
  RUN npm ci &> /dev/null
  COPY --from=builder ["/app/dist/", "/app/dist/"]
  EXPOSE 3000
  CMD [ "npm", "start", "-s" ]
`

export class DockerPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    if (!hasPlugin(NpmPlugin)) {
      throw new Error('DockerPlugin can only build node docker images')
    }

    let dockerfile: string
    if (hasPlugin(TypeScriptPlugin)) {
      dockerfile = tsDockerfile
    } else {
      dockerfile = jsDockerfile
    }

    let ignoreRules = ['*.env', '.DS_Store']

    if (hasPlugin(NpmPlugin)) ignoreRules.push('node_modules')
    if (hasPlugin(JestPlugin)) ignoreRules.push('coverage')
    if (hasPlugin(TypeScriptPlugin)) ignoreRules.push('dist')

    root.addChild(
      new VFile('Dockerfile', dockerfile, PatchMode.placeholder),
      new VIgnoreFile(
        '.dockerignore',
        'Files to ignore from the docker daemon',
        ignoreRules
      )
    )
  }
}
