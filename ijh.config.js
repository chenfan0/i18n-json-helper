

export default {
  localesDir: './locales-separate/',
  mode: 'separate',
  // localesDir: './locales-single',
  // mode: 'single',
  baseLang: 'en',
  targetLangs: ['de', 'cn'],
  // translateFn(baseLangText, translateLang) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(`${translateLang} + ${baseLangText}`)
  //     }, 1000)
      
  //   })
  // },
}
