import fs from 'fs'
import cp from 'child_process'
import cbGlob from 'glob'
import { promisify } from 'util'

/** fs.readFile but with promises */
export const readFile = fs.promises.readFile

/** fs.writeFile but with promises */
export const writeFile = fs.promises.writeFile

/** fs.mkdir but with promises */
export const mkdir = fs.promises.mkdir

/** fs.readdir but with promises */
export const readdir = fs.promises.readdir

/** child_process.exec with promises */
export const exec = promisify(cp.exec)

/** glob with promises */
export const glob = promisify(cbGlob)
