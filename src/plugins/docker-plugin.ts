import { VIgnoreFile, VFile } from '../vnodes'
import { Plugin, PatchStrategy } from '../types'
import { trimInlineTemplate } from '../utils'

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

export const dockerPlugin: Plugin = {
  name: 'docker',
  version: '0.0.0',

  async apply(root, { hasPlugin }) {
    if (!hasPlugin('npm')) {
      throw new Error('DockerPlugin can only build node docker images')
    }

    let dockerfile = hasPlugin('typescript') ? tsDockerfile : jsDockerfile

    let ignoreRules = ['*.env', '.DS_Store', 'node_modules']

    if (hasPlugin('jest')) ignoreRules.push('coverage')
    if (hasPlugin('typescript')) ignoreRules.push('dist')

    root.addChild(
      new VFile('Dockerfile', dockerfile, PatchStrategy.placeholder),
      new VIgnoreFile(
        '.dockerignore',
        'Files to ignore from the docker daemon',
        ignoreRules
      )
    )
  },
}
