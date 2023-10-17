# i18n-json-helper

<p align='center'>
<b>English</b> | <a href="https://github.com/chenfan0/i18n-json-helper/blob/main/README.zh-CN.md">简体中文</a>
</p>

- Auto-Completion of Missing JSON Files and Fields in Other Languages Based on Base Language
- Automatic Simplification of Redundant Fields in Other Languages Based on Base Language
- Replacement of JSON with User-Provided Translations

## Usage
### Install
`pnpm i -D i18n-json-helper`
### Create config file
```js
// ijh.config.js
import { defineConfig } from 'i18n-json-helper'

export default {
  localesDir: './locales', // i18n json dir path. default: './locales'
  baseLang: 'en',  // baseLang. default: 'en'
  targetLangs: ['cn'], // targetLangs. default: []
  space: 2,  // json stringify space num. default: 2 
  mode: 'separate', // json mode，Is one JSON file containing multiple languages, or does each language have its own separate JSON file. default: 'separate'
  outputDir: './ijh-needTranslate', // The generated files to be translated dir. default: './ijh-needTranslate'
  translateFn: (baseLangText, targetLang) => {}, // If provided, during the synchronization of JSON, this function will use the returned result as the content for other JSON items that require translation. default: undefined
  translationDir: './ijh-translation'  // Directory containing translated JSON files, used for replacing JSON during the translation process. default: './ijh-translation'
}

```

### Auto complete
`ijh -c` or `ijh --complete`
#### without translateFn 
- separate mode
```javascript
// before
// locales/en/home.json
{
  "title": "en home title",
  "foo": "en foo"
};
// locales/cn/home.json
{
  "title": "cn home title" // Missing field foo
}

// after ijh -c
// locales/cn/home.json
{
  "title": "cn home title", 
  "foo": "en foo" // Automatically fill in missing fields
}

// Simultaneously generate ijh-needTranslate/cn/home.json
{
  "foo": "en foo"
}
```
- single mode
```javascript
// before
// locales/home.json
{
  "en": {
    "title": "en home title",
    "foo": "en foo"
  },
  "cn": {
    "title": "cn home title" // Missing field foo
  }
};

// after ijh -c
// locales/home.json
{
  "en": {
    "title": "en home title",
    "foo": "en foo"
  },
  "cn": {
    "title": "cn home title",
    "foo": "en foo" // Automatically fill in missing fields
  }
};

// Simultaneously generate ijh-needTranslate/home.json
{
  "cn": {
    "foo": "en foo"
  }
}
```

#### config translateFn
```javascript
translateFn: (baseLangText, targetLang) => `${baseLangText} -> ${targetLang}`
```

```javascript
// before
// locales/en/home.json
{
  "title": "en home title",
  "foo": "en foo"
};
// locales/cn/home.json
{
  "title": "cn home title" // Missing field foo
}

// after ijh -c
// locales/cn/home.json
{
  "title": "cn home title", 
  "foo": "en foo -> cn" // Automatically fill in missing fields  use translateFn return value
}

// Simultaneously generate ijh-needTranslate/cn/home.json
{
  "foo": "en foo -> cn"
}
```
### Auto simplify json
`ijh -s` or `ijh --simplify`
```javascript
// before
// locales/en/home.json
{
  "title": "en home title"
}

// locales/cn/home.json
{
  "title": "cn home title",
  "foo": "foo"  // Excess fields.
}

// after ijh -s
// locales/cn/home.json
{
  "title": "cn home title"
}
```

### Auto replace json
`ijh -r` or `ijh --replace`
```javascript


// before
// ./locales/cn/home.json
{
  "title": "need translate cn home title"
}

// ./ijh-translation/cn/home.json  Translated JSON files
{
  "title": "translated cn home title"
}

// after ijh -r
// ./locales/cn/home.json
{
  "title": "translated cn home title"
}

```