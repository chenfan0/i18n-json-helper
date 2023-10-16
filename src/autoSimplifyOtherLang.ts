import fsp from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'

import type { ConfigType } from './type'
import { simplifyObj } from './utils'

async function autoSimplifyOtherLangInSingleMode(config: ConfigType) {
  const { localesDir, baseLang, targetLangs, space } = config
  const jsonPaths = await fg.async(`${localesDir}/**/*.json`)

  const pList: Promise<any>[] = []
  for (const jsonPath of jsonPaths) {
    const jsonContent = await fsp.readFile(jsonPath, { encoding: 'utf-8' })
    const jsonObj = JSON.parse(jsonContent)

    const baseLangObj = jsonObj[baseLang]
    if (!baseLangObj)
      continue

    for (const targetLang of targetLangs) {
      const targetLangObj = jsonObj[targetLang]
      if (!targetLangObj)
        continue
      jsonObj[targetLang] = simplifyObj(targetLangObj, baseLangObj)
    }
    pList.push(
      fsp.writeFile(jsonPath, JSON.stringify(jsonObj, null, ' '.repeat(space))),
    )
  }

  await Promise.all(pList)
}

async function autoSimplifyOtherLangInSeparateMode(config: ConfigType) {
  const { localesDir, baseLang, targetLangs, space } = config
  const baseLangJsonRelativePaths = (await fg.async(`${localesDir}/${baseLang}/**/*.json`)).map((filePath) => {
    const relativePath = path.relative(`${localesDir}/${baseLang}`, filePath)
    return relativePath
  })

  const pList: Promise<any>[] = []

  for (const baseLangJsonRelativePath of baseLangJsonRelativePaths) {
    const baseLangJsonPath = path.resolve(localesDir, baseLang, baseLangJsonRelativePath)
    const baseLangJsonContent = await fsp.readFile(baseLangJsonPath, { encoding: 'utf-8' })

    if (!baseLangJsonContent)
      continue

    const baseLangJsonObj = JSON.parse(baseLangJsonContent)

    for (const targetLang of targetLangs) {
      const targetLangJsonPath = path.resolve(localesDir, targetLang, baseLangJsonRelativePath)
      let targetLangJsonContent!: string
      try {
        targetLangJsonContent = await fsp.readFile(targetLangJsonPath, { encoding: 'utf-8' })
      } catch {
        continue
      }
      const targetLangJsonObj = JSON.parse(targetLangJsonContent)
      const simplifiedTargetLangJsonObj = simplifyObj(targetLangJsonObj, baseLangJsonObj)
      pList.push(
        fsp.writeFile(
          targetLangJsonPath,
          JSON.stringify(simplifiedTargetLangJsonObj, null, ' '.repeat(space))
        )
      )
    }
  }

  await Promise.all(pList)
}

export async function autoSimplifyOtherLang(config: ConfigType) {
  const { mode } = config

  switch (mode) {
    case 'single':
      await autoSimplifyOtherLangInSingleMode(config)
      break
    case 'separate':
      await autoSimplifyOtherLangInSeparateMode(config)
      break
  }
}
