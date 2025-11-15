import type { CommonEntityProperties } from '../../types/handler-internal'

export default function parseCommonEntityProperties(
  type: number,
  value: string | number
): CommonEntityProperties {
  switch (type) {
    case 5: {
      return {
        handle: value as string,
      }
    }
    case 6:
      // Linetype name (present if not BYLAYER).
      // The special name BYBLOCK indicates a
      // floating linetype. (optional)
      return {
        lineTypeName: value as string,
      }
    case 8:
      return {
        layer: value as string,
      }
    case 48:
      // Linetype scale (optional)
      return {
        lineTypeScale: value as number,
      }
    case 60:
      // Object visibility (optional): 0 = visible, 1 = invisible.
      return {
        visible: value === 0,
      }
    case 62:
      // Color number (present if not BYLAYER).
      // Zero indicates the BYBLOCK (floating) color.
      // 256 indicates BYLAYER.
      // A negative value indicates that the layer is turned off. (optional)
      return {
        colorNumber: value as number,
      }
    case 67:
      // Paper space or sheet.
      // Absent or zero indicates entity is in model space. 1 indicates entity is in paper space (optional)
      return value === 0
        ? {}
        : {
            paperSpace: value as number,
          }
    case 68:
      // Identifies whether viewport is on but fully off screen, is not active, or is off
      return {
        viewportOn: value as number,
      }
    case 69:
      // Viewport identification number
      return {
        viewport: value as number,
      }
    case 210:
      return {
        extrusionX: value as number,
      }
    case 220:
      return {
        extrusionY: value as number,
      }
    case 230:
      return {
        extrusionZ: value as number,
      }
    case 410:
      return {
        layout: value as string,
      }
    default:
      return {}
  }
}
