import { readFileSync } from 'fs'
import { join } from 'path'

//
// index.js
//
export const indexJs = (name = 'World') =>
  `
// 
// The app entrypoint
// 
;(async () => {
  console.log('Hello, ${name}!')
})()
`.trimLeft()

//
// .dockerignore
//
export const dockerignore = () =>
  `
#
# Ignore files from the docker command
#

.git
node_modules
coverage
.DS_Store
*.env
`.trimLeft()

//
// .editorconfig
//
export const editorconfig = () =>
  `
#
# Editor config, for sharing IDE preferences ~ https://editorconfig.org/
#

root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
`.trimLeft()

//
// .eslint.yml
//
export const eslintYml = () =>
  `
#
# Configuration for eslint, a javascript linter
# Setup to find errors with standardJS but leave formatting to Prettier
#

root: true

parserOptions:
  sourceType: 'module'
  ecmaVersion: 2018

env:
  node: true
  jest: true

extends:
  - standard
  - prettier
  - prettier/standard
`.trimLeft()

//
// .gitignore
//
export const gitignore = () =>
  `
#
# Ignore files from git source control
#

node_modules
coverage
.DS_Store
*.env
`.trimLeft()

//
// .prettierrc.yml
//
export const prettierrcYml = () =>
  `
#
# Configuration for Prettier
#

semi: false
singleQuote: true
`.trimLeft()

//
// Dockerfile
//
export const dockerfile = () =>
  `
# Use a node alpine image install packages and run the start script
FROM node:10-alpine
WORKDIR /app
EXPOSE 3000
COPY ["package*.json", "/app/"]
ENV NODE_ENV production
RUN npm ci &> /dev/null
COPY src /app/src
CMD [ "npm", "start", "-s" ]
`.trimLeft()

//
// README.md
//
export const readme = (name: string = 'A Node project') =>
  `
# ${name}

This project was set up by [puggle](https://npm.im/puggle)

> Coming soon
`.trimLeft()

// package.json
export const packageJson = () =>
  JSON.parse(readFileSync(join(__dirname, '../data/basePackage.json'), 'utf8'))

//
// REGISTRY
//
export const registry = () =>
  `
USERNAME/PROJECT
`.trimLeft()
