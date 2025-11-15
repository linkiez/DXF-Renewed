import type { ColorRGB } from './colors'

/**
 * Convert a ColorRGB tuple to a CSS string definition.
 * Converts white lines to black as the default.
 */
export default function rgbToColorAttribute(rgb: ColorRGB): string {
  const [r, g, b] = rgb
  if (r === 255 && g === 255 && b === 255) {
    return 'rgb(0, 0, 0)'
  } else {
    return `rgb(${r}, ${g}, ${b})`
  }
}
