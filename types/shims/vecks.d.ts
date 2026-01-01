declare module 'vecks' {
  export interface Vec2 {
    x: number
    y: number
  }

  export class Box2 {
    min: Vec2
    max: Vec2

    constructor(min?: Vec2, max?: Vec2)
  }

  export function V2(x?: number, y?: number): Vec2
}
