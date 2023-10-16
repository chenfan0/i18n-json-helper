import path from 'node:path'
import { cwd } from 'node:process'

import { BASE_CONFIG, CONFIG_File_NAME } from './constant'
import type { ConfigType } from './type'

const configFilePath = path.resolve(cwd(), CONFIG_File_NAME)

export function defineConfig(config: ConfigType) {
  return config
}

export async function getConfig() {
  let config = {}

  try {
    config = (await import(configFilePath)).default
  } catch {}

  const resolvedConfig = { ...BASE_CONFIG, ...config } as ConfigType

  // make sure path is absolute
  resolvedConfig.localesDir = path.resolve(cwd(), resolvedConfig.localesDir)
  resolvedConfig.outputDir = path.resolve(cwd(), resolvedConfig.outputDir)

  return resolvedConfig
}

