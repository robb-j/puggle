import got from 'got'
import semver from 'semver'
import { StringKeyed } from '../types'

const REGISTRY_URL = 'https://registry.npmjs.org/'

export async function findLatestPackageVersion(
  packageName: string,
  semverRange: string
): Promise<string> {
  const npmPackage = await got(REGISTRY_URL + packageName, { json: true })

  const allMatches = Object.keys(npmPackage.body.versions).filter(version =>
    semver.satisfies(version, semverRange)
  )

  if (allMatches.length === 0) {
    throw new Error()
  }

  allMatches.sort((a, b) => {
    if (semver.eq(a, b)) return 0
    else if (semver.gt(a, b)) return -1
    else return 1
  })

  return allMatches[0]
}

export async function findLatestDependencies(
  dependencies: StringKeyed<string>
) {
  const promises = Object.keys(dependencies).map(async key => {
    const version = await findLatestPackageVersion(key, dependencies[key]!)
    return { [key]: version }
  })

  const versions = await Promise.all(promises)

  return versions.reduce((map, dep) => Object.assign(map, dep), {})
}
