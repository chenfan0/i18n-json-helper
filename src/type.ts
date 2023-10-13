export interface ConfigType {
  localesDir: string,
  baseLang: string,
  translateLangs: string[],
  space: number,
  mode: 'separate' | 'single',
  translateFn?: (baseLangText: string, translateLang: string) => string
}