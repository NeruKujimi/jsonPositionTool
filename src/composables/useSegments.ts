import { ref, computed } from 'vue'
import type { Segment } from '@/types'

let idCounter = 0

export function useSegments() {
  const segments = ref<Segment[]>([])

  function addSegment(opts?: Partial<Segment>) {
    const prev = segments.value.length > 0 ? segments.value[segments.value.length - 1] : null
    const seg: Segment = {
      id: idCounter++,
      startTime: opts?.startTime ?? (prev ? prev.endTime : 0),
      endTime: opts?.endTime ?? (prev ? prev.endTime + 1000 : 1000),
      startX: opts?.startX ?? (prev ? prev.endX : 0),
      startY: opts?.startY ?? (prev ? prev.endY : 0),
      endX: opts?.endX ?? (prev ? Math.min(Math.max(prev.endX + 2, -10), 10) : 2),
      endY: opts?.endY ?? (prev ? Math.min(Math.max(prev.endY, -10), 10) : 0),
      easeType: opts?.easeType ?? 'Linear',
      linked: opts?.linked ?? (!!prev),
    }
    segments.value.push(seg)
    propagateLink(seg)
  }

  function removeSegment(id: number) {
    const idx = segments.value.findIndex(s => s.id === id)
    if (idx === -1) return
    segments.value.splice(idx, 1)
  }

  function updateField(id: number, field: keyof Segment, value: number | string | boolean) {
    const seg = segments.value.find(s => s.id === id)
    if (!seg) return
    ;(seg as Record<string, unknown>)[field] = value
    if (field === 'endTime' || field === 'endX' || field === 'endY') {
      propagateLink(seg)
    }
  }

  function toggleLinked(id: number, linked: boolean) {
    const seg = segments.value.find(s => s.id === id)
    if (!seg) return
    seg.linked = linked
    if (seg.linked) {
      const idx = segments.value.indexOf(seg)
      if (idx > 0) {
        const prev = segments.value[idx - 1]!
        seg.startTime = prev.endTime
        seg.startX = prev.endX
        seg.startY = prev.endY
      }
    }
  }

  function propagateLink(changedSeg: Segment) {
    const idx = segments.value.indexOf(changedSeg)
    for (let i = idx + 1; i < segments.value.length; i++) {
      const seg = segments.value[i]!
      if (seg.linked) {
        const prev = segments.value[i - 1]!
        seg.startTime = prev.endTime
        seg.startX = prev.endX
        seg.startY = prev.endY
      } else {
        break
      }
    }
  }

  function parseJson(json: any[], timeUnit: 'milliseconds' | 'seconds' = 'milliseconds') {
    segments.value = json.map((item, index) => {
      // Handle different JSON formats
      let startTime = 0
      let endTime = 1000
      let startX = 0
      let startY = 0
      let endX = 200
      let endY = 0
      let easeType = 'Linear'
      let linked = index > 0

      // Standard format
      if (item.startTime !== undefined) {
        let timeValue = typeof item.startTime === 'string' ? parseFloat(item.startTime) : item.startTime
        // Convert to milliseconds if needed
        if (timeUnit === 'seconds') {
          timeValue *= 1000
        }
        startTime = timeValue
      }
      if (item.endTime !== undefined) {
        let timeValue = typeof item.endTime === 'string' ? parseFloat(item.endTime) : item.endTime
        // Convert to milliseconds if needed
        if (timeUnit === 'seconds') {
          timeValue *= 1000
        }
        endTime = timeValue
      }
      if (item.startX !== undefined) {
        startX = Math.min(Math.max(item.startX, -10), 10)
      }
      if (item.startY !== undefined) {
        startY = Math.min(Math.max(item.startY, -10), 10)
      }
      if (item.endX !== undefined) {
        endX = Math.min(Math.max(item.endX, -10), 10)
      }
      if (item.endY !== undefined) {
        endY = Math.min(Math.max(item.endY, -10), 10)
      }
      if (item.easeType !== undefined) {
        easeType = item.easeType
      }
      if (item.linked !== undefined) {
        linked = item.linked
      }
      if (item.followPrevious !== undefined) {
        linked = item.followPrevious
      }

      // Alternative format with startPos/endPos
      if (item.startPos) {
        startX = item.startPos.x ?? startX
        startY = item.startPos.y ?? startY
      }
      if (item.endPos) {
        endX = item.endPos.x ?? endX
        endY = item.endPos.y ?? endY
      }

      // Alternative format with easeType under position
      if (item.type === 'position' && item.easeType) {
        easeType = item.easeType
      }

      return {
        id: idCounter++,
        startTime,
        endTime,
        startX,
        startY,
        endX,
        endY,
        easeType,
        linked,
      }
    })
  }

  const maxEndTime = computed(() => {
    if (segments.value.length === 0) return 0
    return Math.max(...segments.value.map(s => s.endTime))
  })

  return {
    segments,
    addSegment,
    removeSegment,
    updateField,
    toggleLinked,
    maxEndTime,
    parseJson,
  }
}