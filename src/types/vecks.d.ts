declare module 'vecks' {
  export class V2 {
    x: number
    y: number

    constructor(x: number, y: number)

    add(other: V2): V2
    sub(other: V2): V2
    multiply(scalar: number): V2
    norm(): V2
    length(): number
  }

  interface Point {
    x: number
    y: number
  }

  export class Box2 {
    min: Point
    max: Point
    valid: boolean

    constructor()

    expandByPoint(point: Point): Box2
  }
}
