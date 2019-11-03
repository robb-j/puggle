#!/usr/bin/env node

import { Puggle } from './Puggle'
import { trimInlineTemplate } from './utils'
import yargs from 'yargs'

// Use require to avoid it being compilled in
const packageJson = require('../package.json')

const initMessage = trimInlineTemplate`
  This utility walks you through the creation of a puggle (${packageJson.version}) project.
  
  It will initialize a new project in the directory of your choosing.

  Press ^C at any time to quit.
`

yargs
  .option('dryrun', {
    describe: `Don't actually create files`,
    type: 'boolean',
    default: false
  })
  .scriptName('puggle')
  .alias('i', 'init')
  .alias('u', 'update')
  .help()
  .command(
    ['init [path]', '$0 [path]'],
    'Bootstrap a new project',
    yargs =>
      yargs.positional('path', {
        type: 'string',
        describe: 'Where to initialize into'
      }),
    yargs => {
      console.log(initMessage)

      Puggle.initFromEnvironment({
        path: yargs.path,
        dryRun: yargs.dryrun
      })
    }
  )
  .command(
    'update [path]',
    'Update a project setup with puggle',
    yargs => yargs,
    () => {
      console.log('Coming soon ...')
    }
  )

if (process.env.NODE_ENV === 'development') {
  const { TestPreset } = require('./utils/TestPreset')

  yargs.command(
    'test:init [path]',
    'Run the cli with a test preset',
    yargs =>
      yargs
        .positional('path', { type: 'string' })
        .option('dryrun', { type: 'boolean', default: false }),
    async argv => {
      console.log(initMessage)

      let p = new Puggle(new TestPreset())
      await p.init(argv)
    }
  )

  yargs.command(
    'test:update [path]',
    'Run the cli with a test preset',
    yargs =>
      yargs
        .positional('path', { type: 'string' })
        .option('dryrun', { type: 'boolean', default: false }),
    async argv => {
      await Puggle.updateFromEnvironment({
        ...argv,
        presets: [new TestPreset()]
      })
    }
  )
}

yargs.parse()
