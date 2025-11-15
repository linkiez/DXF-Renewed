/**
 * Apply the transforms to the polyline.
 *
 * @param polyline the polyline
 * @param transforms the transforms array
 * @returns the transformed polyline
 */

type Point = [number, number]

interface Transform {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
  extrusionZ?: number
}

export default function applyTransforms(
  polyline: Point[],
  transforms?: Transform[],
): Point[] {
  if (!transforms) {
    return polyline
  }

  let result = polyline
  for (const transform of transforms) {
    result = result.map((p) => {
      // Use a copy to avoid side effects
      let p2: Point = [p[0], p[1]]
      if (transform.scaleX) {
        p2[0] = p2[0] * transform.scaleX
      }
      if (transform.scaleY) {
        p2[1] = p2[1] * transform.scaleY
      }
      if (transform.rotation) {
        const angle = (transform.rotation / 180) * Math.PI
        p2 = [
          p2[0] * Math.cos(angle) - p2[1] * Math.sin(angle),
          p2[1] * Math.cos(angle) + p2[0] * Math.sin(angle),
        ]
      }
      if (transform.x) {
        p2[0] = p2[0] + transform.x
      }
      if (transform.y) {
        p2[1] = p2[1] + transform.y
      }
      // Observed once in a sample DXF - some cad applications
      // use negative extruxion Z for flipping
      if (transform.extrusionZ === -1) {
        p2[0] = -p2[0]
      }
      return p2
    })
  }
  return result
}
