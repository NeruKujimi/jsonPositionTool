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
  return segments
    .map(seg => {
      const json = segmentToJson(seg, timeUnit)
      return `{"startTime": "${json.startTime}","endTime": ${json.endTime},"type": "position","followPrevious": ${json.followPrevious},"startPos": {"x": ${json.startPos.x},"y": ${json.startPos.y}},"endPos": {  "x": ${json.endPos.x},  "y": ${json.endPos.y}},"easeType": "${json.easeType}","posType": "Straight"}`
    })
    .join(',\n')
}