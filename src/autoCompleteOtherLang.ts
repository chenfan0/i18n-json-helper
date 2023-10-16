import fsp from 'node:fs/promises'
import path from 'node:path'

import fg from 'fast-glob'
import type { ConfigType } from './type'
import { forEachObj, isEmptyObj, mergeObj } from './utils'

async function autoCompleteOtherLangInSeparateMode(config: ConfigType) {
  const { localesDir, baseLang, targetLangs, space, outputDir, translateFn } = config
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

    for (const targetLang of targetLangs) {
      if (targetLang === baseLang)
        continue
      const targetLangJsonPath = path.resolve(localesDir, targetLang, baseLangJsonRelativePath)
      const needTranslateJsonPath = path.resolve(outputDir, targetLang, baseLangJsonRelativePath)

      // make sure the dir is exist
      await Promise.all([
        fsp.mkdir(path.dirname(targetLangJsonPath), { recursive: true }),
        fsp.mkdir(path.dirname(needTranslateJsonPath), { recursive: true }),
      ])

      let newJsonContent!: string

      const defaultJsonObj = JSON.parse(baseLangJsonContent) as Record<string, any>

      if (translateFn) {
        await forEachObj(defaultJsonObj, async (obj, key, val) => {
          return await translateFn(val, targetLang)
        })
      }
      let needTranslateJsonContent!: string
      try {
        const targetLangJsonContent = await fsp.readFile(targetLangJsonPath, { encoding: 'utf-8' })
        const targetLangJsonObj = JSON.parse(targetLangJsonContent) as Record<string, any>
        const [newTargetLangJsonObj, needTranslateJsonObj] = mergeObj(targetLangJsonObj, defaultJsonObj, translateFn ? 'source' : 'targe')

        !isEmptyObj(needTranslateJsonObj) && (needTranslateJsonContent = JSON.stringify(needTranslateJsonObj, null, ' '.repeat(space)))

        newJsonContent = JSON.stringify(newTargetLangJsonObj, null, ' '.repeat(space))
      }
      catch {
        if (translateFn)
          newJsonContent = JSON.stringify(defaultJsonObj, null, ' '.repeat(space))

        else
          newJsonContent = baseLangJsonContent
      }
      finally {
        if (needTranslateJsonContent) {
          pList.push(
            fsp.writeFile(
              needTranslateJsonPath,
              needTranslateJsonContent,
            ),
          )
        }

        pList.push(
          fsp.writeFile(
            targetLangJsonPath,
            newJsonContent,
          ),
        )
      }
    }
  }

  await Promise.all(pList)
}

async function autoCompleteOtherLangInSingleMode(config: ConfigType) {
  const { localesDir, baseLang, targetLangs, outputDir, translateFn, space } = config
  const jsonPaths = await fg.async(`${localesDir}/**/*.json`)
  const highPriorityVal = translateFn ? 'source' : 'targe'

  const pList: Promise<any>[] = []

  for (const jsonPath of jsonPaths) {
    const jsonContent = await fsp.readFile(jsonPath, { encoding: 'utf-8' })
    const jsonObj = JSON.parse(jsonContent) as Record<string, any>
    const baseLangObj = jsonObj[baseLang] as Record<string, any>
    if (!baseLangObj) {
      console.error(`cannot find baseLang obj in ${jsonPath}`)
      continue
    }
    const needTranslateJsonObj: Record<string, any> = {}

    if (!baseLangObj)
      continue

    for (const targetLang of targetLangs) {
      if (targetLang === baseLang)
        continue
      const defaultJsonObj = JSON.parse(JSON.stringify(baseLangObj)) as Record<string, any>

      if (translateFn) {
        await forEachObj(defaultJsonObj, async (_, key, val) => {
          return await translateFn(val, targetLang)
        })
      }

      let newTargetLangJsonObj = jsonObj[targetLang] || {}
      let targetNeedTranslateJsonObj!: Record<string, any>
      if (newTargetLangJsonObj)
        [newTargetLangJsonObj, targetNeedTranslateJsonObj] = mergeObj(newTargetLangJsonObj, defaultJsonObj, highPriorityVal)

      else
        newTargetLangJsonObj = defaultJsonObj

      jsonObj[targetLang] = newTargetLangJsonObj
      !isEmptyObj(targetNeedTranslateJsonObj) && (needTranslateJsonObj[targetLang] = targetNeedTranslateJsonObj)
    }
    
    const needTranslateJsonPath = path.resolve(outputDir, path.relative(localesDir, jsonPath))

    await fsp.mkdir(path.dirname(needTranslateJsonPath), { recursive: true })

    pList.push(
      fsp.writeFile(
        jsonPath,
        JSON.stringify(jsonObj, null, ' '.repeat(space))
      ),
      fsp.writeFile(
        needTranslateJsonPath,
        JSON.stringify(needTranslateJsonObj, null, ' '.repeat(space)),
      )
    )
  }
  await Promise.all(pList)
}

export async function autoCompleteOtherLang(
  config: ConfigType,
) {
  // clear out dir
  try {
   await fsp.rm(config.outputDir, { recursive: true })
  } catch {}

  switch (config.mode) {
    case 'separate':
      await autoCompleteOtherLangInSeparateMode(config)
      break
    case 'single':
      await autoCompleteOtherLangInSingleMode(config)
      break
  }
}
