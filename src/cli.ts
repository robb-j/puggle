#!/usr/bin/env node

import { puggle, pickPreset, loadPresets } from './puggle'
import { trimInlineTemplate } from './utils'
import yargs from 'yargs'
import { testPreset } from './utils/test-preset'

// Use require to avoid it being compilled in
const packageJson = require('../package.json')

const initMessage = trimInlineTemplate`
  This utility walks you through the creation of a puggle (${packageJson.version}) project.
  
  It will initialize a new project in the directory of your choosing.

  Press ^C at any time to quit.
`

yargs
  .option('dryRun', {
    describe: `Don't actually create files`,
    type: 'boolean',
    default: false,
  })
  .scriptName('puggle')
  .alias('i', 'init')
  .alias('u', 'update')
  .help()
  .command(
    ['init [path]', '$0 [path]'],
    'Bootstrap a new project',
    (yargs) =>
      yargs.positional('path', {
        type: 'string',
        describe: 'Where to initialize into',
        default: '.',
      }),
    async ({ path, dryRun }) => {
      console.log(initMessage)

      const presets = await loadPresets()
      const preset = await pickPreset(presets)

      await puggle.init(preset, path, { dryRun })
    }
  )
  .command(
    'update [path]',
    'Update a project setup with puggle',
    (yargs) =>
      yargs.positional('path', {
        type: 'string',
        describe: 'Where the puggle project to update is',
        default: '.',
      }),
    async ({ path, dryRun }) => {
      const presets = await loadPresets()
      await puggle.update(path, presets, { dryRun })
    }
  )
  .command(
    'presets',
    'Show the presets that puggle can see',
    (yargs) => yargs,
    async (argv) => {
      const presets = await loadPresets()
      console.log(`Found ${presets.length} preset(s)`)

      for (let preset of presets) {
        console.log(`- ${preset.name}@${preset.version}`)
      }
    }
  )

if (process.env.NODE_ENV === 'development') {
  const { TestPreset } = require('./utils/test-preset')

  yargs.command(
    'test:init [path]',
    'Run the cli with a test preset',
    (yargs) =>
      yargs
        .positional('path', { type: 'string', default: '.' })
        .option('dryRun', { type: 'boolean', default: false }),
    async ({ dryRun, path }) => {
      console.log('Using test preset')

      await puggle.init(testPreset, path, { dryRun })
    }
  )

  yargs.command(
    'test:update [path]',
    'Run the cli with a test preset',
    (yargs) =>
      yargs
        .positional('path', { type: 'string', default: '.' })
        .option('dryRun', { type: 'boolean', default: false }),
    async ({ dryRun, path }) => {
      console.log('Using test preset')

      await puggle.update(path, [testPreset], { dryRun })
    }
  )
}

yargs.parse()
