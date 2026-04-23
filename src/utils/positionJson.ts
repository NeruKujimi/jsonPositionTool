import type { Segment, PositionJsonItem } from '@/types'

export function segmentToJson(seg: Segment): PositionJsonItem {
  return {
    startTime: String(seg.startTime),
    endTime: seg.endTime,
    type: 'position',
    followPrevious: false,
    startPos: { x: seg.startX, y: seg.startY },
    endPos: { x: seg.endX, y: seg.endY },
    easeType: seg.easeType,
    posType: 'Straight',
  }
}

export function segmentsToJsonString(segments: Segment[]): string {
  return segments
    .map(seg => {
      const json = segmentToJson(seg)
      return `{"startTime": "${json.startTime}","endTime": ${json.endTime},"type": "position","followPrevious": false,"startPos": {"x": ${json.startPos.x},"y": ${json.startPos.y}},"endPos": {  "x": ${json.endPos.x},  "y": ${json.endPos.y}},"easeType": "${json.easeType}","posType": "Straight"}`
    })
    .join(',\n')
}