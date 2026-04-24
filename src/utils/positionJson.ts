import type { Segment, PositionJsonItem } from '@/types'

export function segmentToJson(seg: Segment, timeUnit: 'milliseconds' | 'seconds' = 'milliseconds'): PositionJsonItem {
  const startTime = timeUnit === 'seconds' ? seg.startTime / 1000 : seg.startTime
  const endTime = timeUnit === 'seconds' ? seg.endTime / 1000 : seg.endTime
  
  return {
    startTime: String(startTime),
    endTime: endTime,
    type: 'position',
    followPrevious: seg.linked,
    startPos: { x: seg.startX, y: seg.startY },
    endPos: { x: seg.endX, y: seg.endY },
    easeType: seg.easeType,
    posType: 'Straight',
  }
}

export function segmentsToJsonString(segments: Segment[], timeUnit: 'milliseconds' | 'seconds' = 'milliseconds'): string {
  return JSON.stringify(segments.map(seg => segmentToJson(seg, timeUnit)), null, 2)
}