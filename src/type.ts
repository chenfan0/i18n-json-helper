export interface ConfigType {
  localesDir: string,
  baseLang: string,
  targetLangs: string[],
  space: number,
  mode: 'separate' | 'single',
  outputDir: string
  translateFn?: (baseLangText: string, targetLang: string) => Promise<string | number> | string | number
  translationDir?: string
}