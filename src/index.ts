#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

import { cac } from 'cac'

import { getConfig } from './config'
import { autoCompleteOtherLang } from './autoCompleteOtherLang'
import { autoSimplifyOtherLang } from './autoSimplifyOtherLang'

interface GlobalCLIOptions {
  '--'?: string[]
  'c'?: boolean
  'complete'?: boolean
  's'?: boolean
  'simplify'?: boolean
  'e'?: boolean
  'extract'?: boolean
  'd'?: boolean
  'delete'?: boolean
}

const pkg = JSON.parse(readFileSync(resolve(cwd(), './package.json'), { encoding: 'utf-8' }))

const version = pkg.version
const cli = cac('ijh')

cli.option('-c, --complete', 'auto complete other lang json')
cli.option('-s, --simplify', 'simplify json fields that do not exist in baseLang in other json lang')

// -r --replace
// -s --sort

cli.help()
cli.version(version)

const { options } = cli.parse() as { options: GlobalCLIOptions }

;(async () => {
  const config = await getConfig()

  if (options.c || options.complete)
    await autoCompleteOtherLang(config)
  if (options.s || options.simplify)
    await autoSimplifyOtherLang(config)
})()
