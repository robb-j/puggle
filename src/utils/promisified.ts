import fs from 'fs'
import cp from 'child_process'
import cbGlob from 'glob'
import { promisify } from 'util'

/** fs.readFile but with promises */
export const readFile = promisify(fs.readFile)

/** fs.writeFile but with promises */
export const writeFile = promisify(fs.writeFile)

/** fs.mkdir but with promises */
export const mkdir = promisify(fs.mkdir)

/** child_process.exec with promises */
export const exec = promisify(cp.exec)

/** glob with promises */
export const glob = promisify(cbGlob)
