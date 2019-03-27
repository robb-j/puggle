import fs from 'fs'
import { promisify } from 'util'
import { join } from 'path'

import Yaml from 'yaml'
import nestedGet from 'lodash.get'
import nestedSet from 'lodash.set'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

type StringOrStringArray = string | string[]

export const removeSurroundingSlashes = (input: string) =>
  input.replace(/^\/+/, '').replace(/\/+$/, '')

export enum VNodeType {
  file,
  directory
}

//
// The base class of virual filesystem nodes, doesn't do very much
// Other things extend this and add functionality
//
export class VNode {
  name: string
  parent?: VNode

  constructor(name: string) {
    this.name = removeSurroundingSlashes(name)
    Object.defineProperty(this, 'parent', { enumerable: false, writable: true })
  }

  async serialize(path: string): Promise<void> {}
}

//
// A virtual file
//
// Ideas:
// - The contents could be set based on the result of some template
//
export class VFile extends VNode {
  contents: string

  constructor(name: string, contents: string = '') {
    super(name)
    this.contents = contents
  }

  serialize(path: string) {
    return writeFile(join(path, this.name), this.contents)
  }
}

//
// A virtual directory to hold more virtual nodes
//
export class VDir extends VNode {
  children = new Array<VNode>()

  constructor(name: string, children = new Array<VNode>()) {
    super(name)
    this.children = children
    for (let child of children) child.parent = this
  }

  /** find a VNode under this directory using a path e.g. src/index.js */
  find(path: StringOrStringArray): VNode | null {
    let name: string
    let rest: string[]

    if (Array.isArray(path)) {
      ;[name, ...rest] = path
    } else {
      ;[name, ...rest] = removeSurroundingSlashes(path).split('/')
    }

    for (let child of this.children) {
      if (child.name !== name) continue
      if (rest.length === 0) return child
      return child instanceof VDir ? child.find(rest) : null
    }

    return null
  }

  async serialize(path: string) {
    const dir = join(path, this.name)
    await mkdir(dir, { recursive: true })

    await Promise.all(this.children.map(child => child.serialize(dir)))
  }
}

//
// A special virtual directory to be at the root of the virual file system
//
export class VRoot extends VDir {
  constructor(children = new Array<VNode>()) {
    super('.', children)
  }
}

//
// The supported types of config files
//
export enum VConfigType {
  json,
  yaml
}

//
// A virtual config file, a file with some potentially updatable data
//
// Ideas:
// - Provide merging / updating so plugins can alter configs if they want
//
export class VConfig extends VFile {
  contents: any
  type: VConfigType

  constructor(name: string, type: VConfigType, contents: any) {
    super(name)
    this.type = type
    this.contents = contents
  }

  async serialize(path: string) {
    let data: any

    switch (this.type) {
      case VConfigType.json:
        data = JSON.stringify(this.contents, null, 2)
        break
      case VConfigType.yaml:
        data = Yaml.stringify(this.contents)
        break
    }

    return writeFile(join(path, this.name), data)
  }

  read(path: string) {
    return nestedGet(this.contents, path)
  }

  write(path: string, value: any) {
    return nestedSet(this.contents, path, value)
  }
}

//
// The current customization points of a package.json
//
export type VPackageJsonConfig = {
  name?: string
  repository?: string
  author?: string
}

//
// A virtual package.json
// - Attempts to merge with an existing package.json (wip)
//
// Ideas:
// - Some way of dynamically declaring (dev|prod|optional) dependancies
//
export class VPackageJson extends VConfig {
  config: VPackageJsonConfig

  constructor(config: VPackageJsonConfig, contents: any = {}) {
    super('package.json', VConfigType.json, contents)
    this.config = config
  }

  renderContents(existing: any) {
    let output: any = {}

    for (let property in this.contents) {
      output[property] =
        existing[property] === undefined &&
        this.contents[property] !== undefined
          ? this.contents[property]
          : existing[property]
    }

    if (this.config.name && !output.name) {
      output.name = this.config.name
    }

    if (this.config.repository && !output.repository) {
      output.repository = this.config.repository
    }

    if (this.config.author && !output.author) {
      output.author = this.config.author
    }

    return output
  }

  async serialize(path: string) {
    const fullPath = join(path, this.name)

    // Load the existing package.json, ignoring if it wasn't found
    let existing
    try {
      existing = JSON.parse(await readFile(fullPath, 'utf8'))
    } catch (error) {
      existing = {}
    }

    // Write the new package.json
    let data = JSON.stringify(this.renderContents(existing), null, 2)
    return writeFile(fullPath, data)
  }
}
