import path from 'node:path'
import fsp from 'node:fs/promises'

import fg from 'fast-glob'

import type { ConfigType } from './type'
import { mergeObj } from './utils'

export async function autoReplaceOtherLang(config: ConfigType) {
  const { translationDir, localesDir, space } = config

  const translationJsonRelativePaths = (await fg.async(`${translationDir}/**/*.json`)).map(
    translateJsonPath => path.relative(translationDir!, translateJsonPath),
  )

  const pList: Promise<any>[] = []

  for (const translateJsonRelativePath of translationJsonRelativePaths) {
    const translateJsonPath = path.resolve(translationDir!, translateJsonRelativePath)
    const localeJsonPath = path.resolve(localesDir, translateJsonRelativePath)

    try {
      const [translateJsonObj, localeJsonObj] = (await Promise.all([
        fsp.readFile(translateJsonPath, { encoding: 'utf-8' }),
        fsp.readFile(localeJsonPath, { encoding: 'utf-8' }),
      ])).map(content => JSON.parse(content))

      const [translatedLocaleJsonObj] = mergeObj(localeJsonObj, translateJsonObj, 'source')
      pList.push(
        fsp.writeFile(localeJsonPath, JSON.stringify(translatedLocaleJsonObj, null, ' '.repeat(space))),
      )
    }
    catch {
      continue
    }
  }

  await Promise.all(pList)
}
