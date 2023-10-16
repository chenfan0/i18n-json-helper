import { describe, expect, it } from 'vitest'

import { compareObj, forEachObj, mergeObj, simplifyObj } from '../utils';

// describe('compareObj', () => {
//   it.only('should return a empty obj when latestObj and expiredObj is same', () => {
//     const latestObj = {
//       a: 'a',
//       b: 'b',
//       c: {
//         d: 'd',
//         e: 'e',
//       },
//     }
//     const expiredObj = {
//       a: 'a',
//       b: 'b',
//       c: {
//         d: 'd',
//       },
//     }

//     const res = compareObj(latestObj, expiredObj)
//     console.log(res, '==========')
//     expect(res).toEqual({})
//   })

//   it('should return a diff obj', () => {
//     const latestObj = {
//       a: 'a',
//       b: 'b',
//       c: {
//         d: 'd',
//         e: 'e',
//       },
//     }
//     const expiredObj = {
//       a: 'a',
//       b: 'b-',
//       c: {
//         d: 'd',
//       },
//     }

//     const res = compareObj(latestObj, expiredObj)
//     expect(res).toEqual({
//       b: 'b',
//       c: {
//         e: 'e',
//       },
//     })
//   })

//   it('should trim when diff a string property', () => {
//     const latestObj = {
//       a: ' a ',
//     }
//     const expiredObj = {
//       a: 'a',
//     }

//     const res = compareObj(latestObj, expiredObj)
//     expect(res).toEqual({})
//   })
// })

describe('mergeObj', () => {
  it('should use targetVal when value type is same', () => {
    const target = {
      a: 1,
    }
    const source = {
      a: 2,
    }
    const [_target, _patch] = mergeObj(target, source)
    expect(_target).toEqual({
      a: 1,
    })
    expect(_patch).toEqual({})
  })

  it('should use sourceVal when value type is same and highPriorityVal is source', () => {
    const target = {
      a: 1,
    }
    const source = {
      a: 2,
    }

    const [_target, _patch] = mergeObj(target, source, 'source')

    expect(_target).toEqual({
      a: 2,
    })

    expect(_patch).toEqual({})
  })

  it('should use sourceVal when targetVal is undefined', () => {
    const target = {}
    const source = {
      a: 2,
      b: {},
    }

    const [_target, _patch] = mergeObj(target, source)

    expect(_target).toEqual({
      a: 2,
      b: {}
    })
    expect(_patch).toEqual({
      a: 2,
      b: {}
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


    const [_target, _patch] = mergeObj(target, source)

    expect(_target).toEqual({
      a: {
        b: 2,
        c: 4,
      },
      arr: [1, 2, 5],
      objArr: [{ name: 'target', age: 18 }, {}],
    })


    expect(_patch).toEqual({
      a: {
        c: 4
      },
      arr: [undefined, undefined, 5],
      objArr: [
        {
          age: 18
        },
        {}
      ]
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

    expect(obj).toEqual({
      name: 'obj -> name',
      nestedObj: {
        a: 'a -> a',
        b: 'b -> b',
      },
      arr: ['1 -> 0', '2 -> 1', '3 -> 2'],
    })
  })
})

describe('simplifyObj', () => {
  it('simplifyObj', () => {
    const needSimplifyObj = {
      a: 1,
      b: 2,
      obj: {
        name: 'obj',
        needSimplify: 'needSimplify',
        innerArr: [1, 2, 3, 4]
      },
      arr: [1, 2, 3]
    }
    const baseObj = {
      a: 1,
      obj: {
        name: 'baseObj',
        innerArr: [1, 2]
      },
      arr: [1]
    }
    const simplifiedObj = simplifyObj(needSimplifyObj, baseObj)
    expect(simplifiedObj).toEqual({
      a: 1,
      obj: {
        name: 'obj',
        innerArr: [1, 2]
      },
      arr: [1]
    })
  })
})
