import { ref } from 'vue'
import type { Segment } from '@/types'
import { getEaseFunction } from '@/registry/easing'

export function useAnimation() {
  const currentTime = ref(0)
  const playing = ref(false)
  let playStartTime = 0
  let rafId = 0
  let onFrame: (() => void) | null = null

  function setOnFrame(cb: () => void) {
    onFrame = cb
  }

  function play(segments: Segment[], maxTime: number) {
    if (playing.value) return
    playing.value = true
    if (currentTime.value >= maxTime) currentTime.value = 0
    playStartTime = performance.now() - currentTime.value
    function tick(now: number) {
      if (!playing.value) return
      currentTime.value = now - playStartTime
      if (currentTime.value >= maxTime) {
        currentTime.value = maxTime
        playing.value = false
      }
      onFrame?.()
      if (playing.value) {
        rafId = requestAnimationFrame(tick)
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  function pause() {
    playing.value = false
    cancelAnimationFrame(rafId)
  }

  function togglePlay(segments: Segment[], maxTime: number) {
    if (playing.value) {
      pause()
    } else {
      play(segments, maxTime)
    }
  }

  function reset() {
    pause()
    currentTime.value = 0
    onFrame?.()
  }

  function getPointAtTime(segments: Segment[], time: number): { x: number; y: number } {
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i]!
      if (time <= s.endTime || i === segments.length - 1) {
        const duration = s.endTime - s.startTime
        if (duration <= 0) return { x: s.endX, y: s.endY }
        const t = Math.max(0, Math.min(1, (time - s.startTime) / duration))
        const eased = getEaseFunction(s.easeType)(t)
        return {
          x: s.startX + (s.endX - s.startX) * eased,
          y: s.startY + (s.endY - s.startY) * eased,
        }
      }
    }
    if (segments.length === 0) return { x: 0, y: 0 }
    const last = segments[segments.length - 1]!
    return { x: last.endX, y: last.endY }
  }

  return {
    currentTime,
    playing,
    togglePlay,
    reset,
    getPointAtTime,
    setOnFrame,
  }
}