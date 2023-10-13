import { getConfig } from './config'
import { autoGenOtherLang } from './json-process'

(async () => {
  const config = await getConfig()

  // 自动同步json文件，以及json字段
  await autoGenOtherLang(config)

})()
