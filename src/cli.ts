#!/usr/bin/env node

import { RobbJNodePreset } from './presets/RobbjNodePreset'
import { Puggle } from './Puggle'
import { trimInlineTemplate } from './utils'
import { RobbJTsNodePreset } from './presets/RobbJTsNodePreset'

// import { join } from 'path'
// import { VFile, VDir, VRoot, VIgnoreFile } from './VNode'
// import * as file from './file'
// import prompts from 'prompts'

const message = trimInlineTemplate`
  This utility walks you through the creation of a puggle (${
    process.env.npm_package_version
  }) project.

  Usage:
    puggle [path]

  It will initialize a new project in the current directory.

  Press ^C at any time to quit.
`
;(async () => {
  try {
    console.log(message)

    // let preset = new RobbJNodePreset()
    let puggle = new Puggle(new RobbJTsNodePreset())

    await puggle.run()
  } catch (error) {
    console.log(error.message)
  }
})()
