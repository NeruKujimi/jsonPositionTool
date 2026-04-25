export interface Point {
  x: number
  y: number
}

export interface Segment {
  id: number
  startTime: number
  endTime: number
  startX: number
  startY: number
  endX: number
  endY: number
  easeType: string
  linked: boolean
  groupId?: number
}

export interface SegmentGroup {
  id: number
  name: string
  expanded: boolean
  segmentIds: number[]
}

export type EaseFunction = (t: number) => number

export interface EaseEntry {
  name: string
  category: string
  fn: EaseFunction
}

export interface PositionJsonItem {
  startTime: string
  endTime: number
  type: 'position'
  followPrevious: boolean
  startPos: Point
  endPos: Point
  easeType: string
  posType: 'Straight'
  groupId?: number
}

export interface PositionJsonGroup {
  id: number
  name: string
  expanded: boolean
  segmentIds: number[]
}
