#!/usr/bin/env node

import { Puggle } from './Puggle'
import { trimInlineTemplate } from './utils'

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

    await Puggle.runFromEnvironment(process.argv[2])
  } catch (error) {
    console.log(error)
  }
})()
