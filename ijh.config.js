
export default {
  baseLang: 'en',
  targetLangs: ['de', 'cn'],
  // separate
  localesDir: './locales-separate/',
  mode: 'separate',
  outputDir: './ijh-needTranslate-separate',
  translationDir: './ijh-translation-separate/',

  // single
  localesDir: './locales-single',
  mode: 'single',
  outputDir: './ijh-needTranslate-single',
  translationDir: './ijh-translation-single/',
  // translateFn(baseLangText, targetLang) {
  //   return `${baseLangText} -> ${targetLang}`
  // },
}
