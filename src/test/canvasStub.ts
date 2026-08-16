import { vi } from 'vitest'

type CanvasStub = { texts: string[]; fonts: string[]; blobType: string | undefined }

const original = {
  getContext: HTMLCanvasElement.prototype.getContext,
  toBlob: HTMLCanvasElement.prototype.toBlob,
}

const createContextStub = (canvas: HTMLCanvasElement, stub: CanvasStub) => new Proxy({} as Record<string, unknown>, {
  get: (_target, property) => {
    if (property === 'canvas') return canvas
    if (property === 'measureText') return (text: string) => ({ width: Array.from(text).length * 14 })
    if (property === 'createLinearGradient') return () => ({ addColorStop: () => undefined })
    if (property === 'fillText') return (text: string) => { stub.texts.push(text) }
    return () => undefined
  },
  set: (target, property, value) => {
    if (property === 'font') stub.fonts.push(String(value))
    target[String(property)] = value
    return true
  },
})

export const installCanvasStub = (): CanvasStub => {
  const stub: CanvasStub = { texts: [], fonts: [], blobType: undefined }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement, contextId: string) {
    return contextId === '2d' ? createContextStub(this, stub) : null
  } as typeof HTMLCanvasElement.prototype.getContext)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: BlobCallback, type?: string) => {
    stub.blobType = type
    callback(new Blob([new Uint8Array([137, 80, 78, 71])], { type: type ?? 'image/png' }))
  })
  return stub
}

export const installUnsupportedCanvasStub = () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(() => undefined)
}

export const restoreCanvasStub = () => {
  HTMLCanvasElement.prototype.getContext = original.getContext
  HTMLCanvasElement.prototype.toBlob = original.toBlob
}
