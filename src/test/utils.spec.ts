import { describe, expect, it } from 'vitest'

import { compareObj, forEachObj, mergeObj } from '../utils'

describe('compareObj', () => {
  it('should return a empty obj when latestObj and expiredObj is same', () => {
    const latestObj = {
      a: 'a',
      b: 'b',
      c: {
        d: 'd',
        e: 'e',
      },
    }
    const expiredObj = {
      a: 'a',
      b: 'b',
      c: {
        d: 'd',
      },
    }

    const res = compareObj(latestObj, expiredObj)
    expect(res).toMatchObject({})
  })

  it('should return a diff obj', () => {
    const latestObj = {
      a: 'a',
      b: 'b',
      c: {
        d: 'd',
        e: 'e',
      },
    }
    const expiredObj = {
      a: 'a',
      b: 'b-',
      c: {
        d: 'd',
      },
    }

    const res = compareObj(latestObj, expiredObj)
    expect(res).toMatchObject({
      b: 'b',
      c: {
        e: 'e',
      },
    })
  })

  it('should trim when diff a string property', () => {
    const latestObj = {
      a: ' a ',
    }
    const expiredObj = {
      a: 'a',
    }

    const res = compareObj(latestObj, expiredObj)
    expect(res).toMatchObject({})
  })
})

describe('mergeObj', () => {
  it('should use targetVal when value type is same', () => {
    const target = {
      a: 1,
    }
    const source = {
      a: 2,
    }

    expect(mergeObj(target, source)[0]).toMatchObject({
      a: 1,
    })
  })
  it('should use sourceVal when value type is same and highPriorityVal is source', () => {
    const target = {
      a: 1,
    }
    const source = {
      a: 2,
    }

    expect(mergeObj(target, source, 'source')[0]).toMatchObject({
      a: 2,
    })
  })

  it('should use sourceVal when targetVal is undefined', () => {
    const target = {}
    const source = {
      a: 2,
      b: {},
    }

    expect(mergeObj(target, source)[0]).toMatchObject({
      a: 2,
      b: {},
    })
  })

  it('should merge nested obj', () => {
    const target = {
      a: {
        b: 2,
      },
      arr: [1, 2],
      objArr: [{ name: 'target' }],
    }
    const source = {
      a: {
        b: 3,
        c: 4,
      },
      arr: [3, 4, 5],
      objArr: [{ name: 'source', age: 18 }, {}],
    }

    expect(mergeObj(target, source)[0]).toMatchObject({
      a: {
        b: 2,
        c: 4,
      },
      arr: [1, 2, 5],
      objArr: [{ name: 'target', age: 18 }, {}],
    })
  })
})

describe('forEachObj', () => {
  it('forEachObj', async() => {
    const obj = {
      name: 'obj',
      nestedObj: {
        a: 'a',
        b: 'b',
      },
      arr: [1, 2, 3],
    }

    await forEachObj(obj, (obj, key, val) => {
      return obj[key] = `${val} -> ${key}`
    })

    expect(obj).toMatchObject({
      name: 'obj -> name',
      nestedObj: {
        a: 'a -> a',
        b: 'b -> b',
      },
      arr: ['1 -> 0', '2 -> 1', '3 -> 2'],
    })
  })
})
