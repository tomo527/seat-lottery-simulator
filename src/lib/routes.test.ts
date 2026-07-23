import { describe, expect, it } from 'vitest'
import { resolvePageRoute } from './routes'

describe('resolvePageRoute', () => {
  it.each([
    ['/terms', 'terms'],
    ['/terms/', 'terms'],
    ['/privacy', 'privacy'],
    ['/privacy/', 'privacy'],
    ['/', 'home'],
    ['/unknown-path', 'home'],
  ] as const)('%sを%sへ解決する', (pathname, expected) => {
    expect(resolvePageRoute(pathname)).toBe(expected)
  })
})
