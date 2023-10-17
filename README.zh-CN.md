# i18n-json-helper
- 支持以baseLang为基准，自动补全其他语言缺失的JSON文件以及JSON字段，同时自动生成需要翻译的目录
- 支持以baseLang为基准，自动简化其他语言多余字段
- 支持提供用户提供翻译后的JSON，直接进行替换

## 使用
### 安装
`pnpm i -D i18n-json-helper`
### 创建配置文件
```js
// ijh.config.js
import { defineConfig } from 'i18n-json-helper'

export default {
  localesDir: './locales', // i18n json目录 默认值: './locales'
  baseLang: 'en',  // 基准语言 默认值: 'en'
  targetLangs: ['cn'], // 需要翻译的语言, 默认值: []
  space: 2,  // json 格式化空格的个数 默认值: 2 
  mode: 'separate', // json模式，一个json包含多种语言还是每种语言单独一个json 默认值: 'separate'
  outputDir: './ijh-needTranslate', // 生成的待翻译文件路径 默认值: './ijh-needTranslate'
  translateFn: (baseLangText, targetLang) => {}, // 同步json过程中如果提供了该函数，这会将该函数的返回结果作为其他需要翻译json的内容 默认值: undefined
  translationDir: './ijh-translation'  // 已翻译的json目录，用于翻译json替换 默认值: './ijh-translation'
}

```

### 自动同步其他json
`ijh -c` 或者 `ijh --complete`
#### 没有配置translateFn情况
- separate模式
```javascript
// before
// locales/en/home.json
{
  "title": "en home title",
  "foo": "en foo"
};
// locales/cn/home.json
{
  "title": "cn home title" // 缺少 foo 字段
}

// after ijh -c
// locales/cn/home.json
{
  "title": "cn home title", 
  "foo": "en foo" // 自动补齐缺少的字段
}

// 同时生成 ijh-needTranslate/cn/home.json
{
  "foo": "en foo"
}
```
- single模式
```javascript
// before
// locales/home.json
{
  "en": {
    "title": "en home title",
    "foo": "en foo"
  },
  "cn": {
    "title": "cn home title" // 缺少 foo 字段
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
    "foo": "en foo" // 自动补齐缺少的字段
  }
};

// 同时生成 ijh-needTranslate/home.json
{
  "cn": {
    "foo": "en foo"
  }
}
```

#### 配置translateFn情况
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
  "title": "cn home title" // 缺少 foo 字段
}

// after ijh -c
// locales/cn/home.json
{
  "title": "cn home title", 
  "foo": "en foo -> cn" // 自动补齐缺少的字段 translateFn的返回值
}

// 同时生成 ijh-needTranslate/cn/home.json
{
  "foo": "en foo -> cn"
}
```
### 自动简化json文件
`ijh -s` 或者 `ijh --simplify`
```javascript
// before
// locales/en/home.json
{
  "title": "en home title"
}

// locales/cn/home.json
{
  "title": "cn home title",
  "foo": "foo"  // 多余的字段
}

// after ijh -s
// locales/cn/home.json
{
  "title": "cn home title"
}
```

### 自动替换翻译后的json文件
`ijh -r` 或者 `ijh --replace`
```javascript


// before
// ./locales/cn/home.json
{
  "title": "need translate cn home title"
}

// ./ijh-translation/cn/home.json  翻译好的json文件
{
  "title": "translated cn home title"
}

// after ijh -r
// ./locales/cn/home.json
{
  "title": "translated cn home title"
}

```