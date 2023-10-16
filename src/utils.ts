export const isObj = (val: any) => typeof val === 'object' && val !== null
export const isStr = (val: any) => typeof val === 'string'
export const getType = (val: any) => Object.prototype.toString.call(val).slice(8, -1)
export const isEmptyObj = (val: Record<string, any>) => Object.keys(val).length === 0

export function compareObj(latestObj: Record<string, any>, expiredObj: Record<string, any>) {
  const keys = Object.keys(latestObj)
  const returnObj = {} as Record<string, any>

  for (const key of keys) {
    const v1 = latestObj[key]
    const v2 = expiredObj[key]

    if (
      v1 === v2
      || isStr(v1) && isStr(v2) && v1.trim() === v2.trim()
    ) continue

    if (isObj(v1) && isObj(v2)) {
      const compareRes = compareObj(v1, v2)
      const isEmptyObj = Object.keys(compareRes).length === 0

      if (!isEmptyObj)
        returnObj[key] = compareRes
    }
    else {
      returnObj[key] = v1
    }
  }

  return returnObj
}

// target source both record or both array
export function mergeObj(
  target: Record<string, any> | any[],
  source: Record<string, any> | any[],
  highPriorityVal: 'targe' | 'source' = 'targe',
) {
  const keys = Object.keys(source)
  const needTranslateObj: Record<string, any> = Array.isArray(source) ? [] : {}

  for (const key of keys) {
    const sourceVal = (source as any)[key]

    if (!Object.hasOwn(target, key)) {
      (target as any)[key] = sourceVal
      needTranslateObj[key] = sourceVal
      continue
    }

    const targetVal = (target as any)[key]

    if (
      targetVal === sourceVal
    ) continue

    const targetValType = getType(targetVal)
    const sourceValType = getType(sourceVal)
    const isSameType = targetValType === sourceValType

    // if type targetVal difference sourceVal, use sourceVal type
    if (!isSameType) {
      (target as any)[key] = sourceVal
      needTranslateObj[key] = sourceVal
      continue
    }

    if (isObj(sourceVal)) {
      const res = mergeObj(targetVal, sourceVal, highPriorityVal)
      ;(target as any)[key] = res[0]
      !isEmptyObj(res[1]) && (needTranslateObj[key] = res[1])
    }
    else {
      (target as any)[key] = highPriorityVal === 'targe'
        ? targetVal
        : sourceVal
    }
  }

  return [target, needTranslateObj]
}

export async function forEachObj(
  obj: Record<string, any>,
  fn: (obj: Record<string, any>, key: string, val: any) => any,
) {
  const keys = Object.keys(obj)

  for (const key of keys) {
    const val = obj[key]
    if (isObj(val))
      obj[key] = await forEachObj(val, fn)

    else
      obj[key] = (await fn(obj, key, val)) || obj[key]
  }

  return obj
}

export function simplifyObj(needSimplifyObj: Record<string, any>, baseObj: Record<string, any>) {
  let simplifiedObj: Record<string, any> = JSON.parse(JSON.stringify(needSimplifyObj))

  const simplifiedKeys = Object.keys(simplifiedObj)
  const baseKeys = Object.keys(baseObj)

  for (const key of simplifiedKeys) {
    if (!baseKeys.includes(key)) {
      delete simplifiedObj[key]
      if (Array.isArray(simplifiedObj)) {
        /**
         * needSimplifyObj: [1, 2, 3, 4, 5]
         * baseObj: [1, 2, 3]
         * expect: [1, 2, 3]
         */
        simplifiedObj = simplifiedObj.slice(0, Number(key))
        break
      }
      continue
    }

    const val1 = simplifiedObj[key]
    const val2 = baseObj[key]
    if (isObj(val1) && isObj(val2))
      simplifiedObj[key] = simplifyObj(val1, val2)
  }

  return simplifiedObj
}
