#!/usr/bin/env node

import { join } from 'path'
import { VFile, VDir, VRoot, VPackageJson } from './VNode'
import * as file from './file'
import prompts from 'prompts'

function lastDirectory(path: string) {
  let parts = path.split('/')
  return parts[parts.length - 1] || '/'
}

const message = `
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
    //
    // Say hello to the nice user
    //
    console.log(message.trim())

    const promptOpts = {
      onCancel: () => process.exit(1)
    }

    let path = process.argv[2] || '.'

    //
    // Confirm they really want to use the current directory
    // Give the user the option to change it
    //
    if (path === '.') {
      let { confirmed } = await prompts(
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Initialize in the current directory?',
          initial: true
        },
        promptOpts
      )

      if (!confirmed) {
        let { newPath } = await prompts(
          {
            type: 'text',
            name: 'newPath',
            message: 'Project path:'
          },
          promptOpts
        )

        path = newPath
      }
    }

    const initialName = lastDirectory(path === '.' ? process.cwd() : path)

    //
    // Ask for the project's name, repo & author
    // With some robb-j defaults (for now)
    //
    let { name, repository, author } = await prompts(
      [
        {
          type: 'text',
          name: 'name',
          message: 'package name',
          initial: initialName
        },
        {
          type: 'text',
          name: 'repository',
          message: 'git repository',
          initial: `robb-j/${initialName}`
        },
        {
          type: 'text',
          name: 'author',
          message: 'author',
          initial: 'Rob Anderson (https://r0b.io)'
        }
      ],
      promptOpts
    )

    const packageConf = { name, repository, author }

    //
    // Create our virtual file system, the project to be created
    //
    const tree = new VRoot([
      new VDir('src', [new VFile('index.js', file.indexJs('Geoff'))]),
      new VFile('.dockerignore', file.dockerignore()),
      new VFile('.editorconfig', file.editorconfig()),
      new VFile('.eslintrc.yml', file.eslintYml()),
      new VFile('.gitignore', file.gitignore()),
      new VFile('.prettierrc', file.prettierrcYml()),
      new VFile('Dockerfile', file.dockerfile()),
      new VPackageJson(packageConf, file.packageJson()),
      new VFile('README.md', file.readme()),
      new VFile('REGISTRY', file.registry())
    ])

    //
    // Make the virtual file system into a real one
    //
    // await tree.serialize(join(process.cwd(), path))
  } catch (error) {
    //
    // Catch and log any errors then exit the program
    //
    console.log(error)
    process.exit(1)
  }
})()
