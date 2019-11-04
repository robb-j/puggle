import { join } from 'path'
import { VDir } from '../vnodes'
import { readdir } from 'fs-extra'

// A fuzzy test for VDirs
// -> Takes into account a VDir from another package may fail an "instanceof"
const isVDir = (obj: any) => obj.constructor.name === 'VDir'

/** Recursively look for virtual nodes that conflict with actual files */
export async function findFileConflicts(basePath: string, directory: VDir) {
  const path = join(basePath, directory.name)

  let contents: Set<string>

  try {
    contents = new Set(await readdir(path))
  } catch (error) {
    // If we failed to read the base directory, there can be no conflicts
    return []
  }

  // Create an array to put conflicting files in
  let conflits = new Array<string>()

  // Look through the directory's children to find conflicts
  for (let child of directory.children) {
    if (isVDir(child)) {
      //
      // If the child is a directory, recurse and look at it's children
      //
      conflits.push(...(await findFileConflicts(path, child as any)))
    } else if (contents.has(child.name)) {
      //
      // If it isn't a directory, check if the file exists
      //
      conflits.push(join(path, child.name))
    }
  }

  // Return the conflics, if there were any
  return conflits
}
