import fsp from 'node:fs/promises'
import path from 'node:path'

import fg from 'fast-glob'
import type { ConfigType } from './type'
import { forEachObj, mergeObj } from './utils'

async function autoGenOtherLangInSeparateMode(config: ConfigType) {
  const { localesDir, baseLang, translateLangs, space, translateFn } = config
  const baseLangJsonRelativePaths = (await fg.async(`${localesDir}/${baseLang}/**/*.json`)).map((filePath) => {
    const relativePath = path.relative(`${localesDir}/${baseLang}`, filePath)
    return relativePath
  })

  const pList: Promise<any>[] = []

  for (const baseLangJsonRelativePath of baseLangJsonRelativePaths) {
    const baseLangJsonPath = path.resolve(localesDir, baseLang, baseLangJsonRelativePath)
    const baseLangJsonContent = await fsp.readFile(baseLangJsonPath, { encoding: 'utf-8' })

    for (const translateLang of translateLangs) {
      const translateJsonPath = path.resolve(localesDir, translateLang, baseLangJsonRelativePath)

      // make sure the dir is exist
      await fsp.mkdir(path.dirname(translateJsonPath), { recursive: true })

      let newJsonContent!: string

      const defaultJsonObj = JSON.parse(baseLangJsonContent) as Record<string, any>

      if (translateFn) {
        forEachObj(defaultJsonObj, (obj, key, val) => {
          return translateFn(val, translateLang)
        })
      }

      try {
        const translateLangJsonContent = await fsp.readFile(translateJsonPath, { encoding: 'utf-8' })
        const translateLangJsonObj = JSON.parse(translateLangJsonContent) as Record<string, any>
        const newTranslateLangJsonObj = mergeObj(translateLangJsonObj, defaultJsonObj, translateFn ? 'source' : 'targe')
        newJsonContent = JSON.stringify(newTranslateLangJsonObj, null, ' '.repeat(space))
      }
      catch {
        if (translateFn)
          newJsonContent = JSON.stringify(defaultJsonObj, null, ' '.repeat(space))

        else
          newJsonContent = baseLangJsonContent
      }
      finally {
        pList.push(fsp.writeFile(
          translateJsonPath,
          newJsonContent,
          { encoding: 'utf-8' },
        ))
      }
    }
  }

  await Promise.all(pList)
}

// TODO
async function autoGenOtherLangInSingleMode(config: ConfigType) {
  
}

export async function autoGenOtherLang(
  config: ConfigType,
) {
  switch (config.mode) {
    case 'separate':
      await autoGenOtherLangInSeparateMode(config)
      break
    case 'single':
     await autoGenOtherLangInSingleMode(config)
     break
  }
}
