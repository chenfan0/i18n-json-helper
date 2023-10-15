#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

import { cac } from 'cac'

import { getConfig } from './config'
import { autoGenOtherLang } from './autoGenOtherLang'
import { extractJson } from './extractJson'

interface GlobalCLIOptions {
  '--'?: string[]
  's'?: boolean
  'sync'?: boolean
  'e'?: boolean
  'extract'?: boolean
  'd'?: boolean
  'delete'?: boolean
}

const pkg = JSON.parse(readFileSync(resolve(cwd(), './package.json'), { encoding: 'utf-8' }))

const version = pkg.version
const cli = cac('ijh')

cli.option('-s, --sync', 'sync other lang json')
cli.option('-d, --delete', 'delete json fields that do not exist in baseLang in other json lang')

// -r --replace
// -s --sort

cli.help()
cli.version(version)

const { options } = cli.parse() as { options: GlobalCLIOptions }

;(async () => {
  const config = await getConfig()

  if (options.s || options.sync)
    await autoGenOtherLang(config)
  if (options.e || options.extract)
    await extractJson(config)
})()
