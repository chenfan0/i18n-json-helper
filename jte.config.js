export default {
  localesDir: './locales/',
  baseLang: 'cn',
  translateLangs: ['en', 'de'],
  translateFn(baseLangText, translateLang) {
    return `${baseLangText} -> ${translateLang}`
  },
}
