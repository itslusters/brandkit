declare module 'potrace' {
  export const Potrace: {
    TURNPOLICY_MINORITY: string
    TURNPOLICY_MAJORITY: string
    TURNPOLICY_BLACK: string
    TURNPOLICY_WHITE: string
  }
  export function trace(
    buffer: Buffer | string,
    options: {
      threshold?: number
      turnPolicy?: string
      optTolerance?: number
      background?: string
      color?: string
    },
    callback: (err: Error | null, svg: string) => void
  ): void

  const _default: {
    trace: typeof trace
    Potrace: typeof Potrace
  }
  export default _default
}
