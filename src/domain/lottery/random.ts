export interface RandomSource {
  nextUint32(): number
}

export const cryptoRandomSource: RandomSource = {
  nextUint32() {
    const values = new Uint32Array(1)
    crypto.getRandomValues(values)
    return values[0]
  },
}

export const randomInt = (maxExclusive: number, source: RandomSource = cryptoRandomSource): number => {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 0x1_0000_0000) {
    throw new RangeError('maxExclusive must be an integer from 1 through 2^32.')
  }
  const range = 0x1_0000_0000
  const limit = Math.floor(range / maxExclusive) * maxExclusive
  let value: number
  do {
    value = source.nextUint32()
  } while (!Number.isInteger(value) || value < 0 || value >= limit)
  return value % maxExclusive
}
