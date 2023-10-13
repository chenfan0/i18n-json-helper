export const isObj = (val: any) => typeof val === 'object' && val !== null
export const isStr = (val: any) => typeof val === 'string'
export const getType = (val: any) => Object.prototype.toString.call(val).slice(8, -1)

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

  for (const key of keys) {
    const sourceVal = (source as any)[key]

    if (!Object.hasOwn(target, key)) {
      (target as any)[key] = sourceVal
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
      continue
    }

    ;(target as any)[key] = isObj(sourceVal)
      ? mergeObj(targetVal, sourceVal, highPriorityVal)
      : highPriorityVal === 'targe'
        ? targetVal
        : sourceVal
  }

  return target
}

export function forEachObj(
  obj: Record<string, any>,
  fn: (obj: Record<string, any>, key: string, val: any) => any,
) {
  const keys = Object.keys(obj)

  for (const key of keys) {
    const val = obj[key]
    if (isObj(val))
      obj[key] = forEachObj(val, fn)

    else
      obj[key] = fn(obj, key, val) || obj[key]
  }

  return obj
}
