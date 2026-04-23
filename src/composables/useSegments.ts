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
      endX: opts?.endX ?? (prev ? prev.endX + 200 : 200),
      endY: opts?.endY ?? (prev ? prev.endY : 0),
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
  }
}