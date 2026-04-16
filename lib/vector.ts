import potrace from 'potrace'

export function pngToSvg(pngBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.trace(
      pngBuffer,
      {
        threshold: 128,
        turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
        optTolerance: 0.2,
        background: 'transparent',
      },
      (err, svg) => {
        if (err) reject(err)
        else resolve(svg)
      }
    )
  })
}
