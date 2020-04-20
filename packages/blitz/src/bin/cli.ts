import * as fs from 'fs'
import * as path from 'path'
const resolveGlobal = require('resolve-global')
const pkgDir = require('pkg-dir')

let usageType: 'local' | 'monorepo' | 'global' | 'global-linked'

const localCLIPkgPath = path.resolve(process.cwd(), 'node_modules', '@blitzjs/cli')
const monorepoCLIPkgPath = path.resolve(process.cwd(), '../..', 'node_modules', '@blitzjs/cli')
const globalCLIPkgPath = resolveGlobal.silent('@blitzjs/cli') as string
const globalLinkedCLIPkgPath = path.resolve(pkgDir.sync(__dirname), '../cli')

function getBlitzPkgJsonPath() {
  switch (usageType) {
    case 'local':
      return path.join(process.cwd(), 'node_modules/blitz/package.json')
    case 'monorepo':
      return path.join(process.cwd(), '../../node_modules/blitz/package.json')
    case 'global':
      return path.join(resolveGlobal.silent('blitz') || '', 'package.json')
    case 'global-linked':
      return path.join(pkgDir.sync(__dirname), 'package.json')
  }
}

let pkgPath
if (fs.existsSync(localCLIPkgPath)) {
  usageType = 'local'
  pkgPath = localCLIPkgPath
} else if (fs.existsSync(monorepoCLIPkgPath)) {
  usageType = 'monorepo'
  pkgPath = monorepoCLIPkgPath
} else if (fs.existsSync(globalCLIPkgPath)) {
  usageType = 'global'
  pkgPath = globalCLIPkgPath
} else {
  usageType = 'global-linked'
  pkgPath = globalLinkedCLIPkgPath
}

// TODO: remove
console.log('DEBUG:', usageType)
console.log('Path:', pkgPath)

const cli = require(pkgPath as string)

const options = require('minimist')(process.argv.slice(2))
if (options._.length === 0 && (options.v || options.version)) {
  try {
    const globalVersion = path.join(resolveGlobal.silent('blitz') || pkgDir.sync(__dirname), 'package.json')
    console.log(`blitz: ${require(globalVersion).version} (global)`)
    if (!usageType.includes('global')) {
      console.log(`blitz: ${require(getBlitzPkgJsonPath()).version} (local)`)
    }
  } catch (e) {
    console.log('blitz error', e)
  }
  process.exit(0)
} else {
  cli.run()
}
