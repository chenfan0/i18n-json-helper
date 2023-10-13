import path from 'node:path'
import { cwd } from 'node:process'

import { BASE_CONFIG, CONFIG_File_NAME } from './constant'
import type { ConfigType } from './type'

const configFilePath = path.resolve(cwd(), CONFIG_File_NAME)

export async function getConfig() {
  const config = (await import(configFilePath)).default

  const resolvedConfig = { ...BASE_CONFIG, ...config } as ConfigType

  resolvedConfig.localesDir = path.resolve(cwd(), resolvedConfig.localesDir)

  return resolvedConfig
}

