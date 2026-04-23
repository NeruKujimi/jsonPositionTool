import type { EaseFunction } from '@/types'

export const easeInElastic: EaseFunction = (t) => {
  if (t === 0 || t === 1) return t
  return -Math.pow(2, 8 * t - 8) * Math.sin((t * 80 - 7.5) * Math.PI / 15)
}

export const easeOutElastic: EaseFunction = (t) => {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -8 * t) * Math.sin((t * 80 - 7.5) * Math.PI / 15) + 1
}

export const easeInOutElastic: EaseFunction = (t) => {
  if (t === 0 || t === 1) return t
  return t < 0.5
    ? -Math.pow(2, 16 * t - 8) * Math.sin((t * 80 - 6) * Math.PI / 14) / 2
    : Math.pow(2, -16 * t + 8) * Math.sin((t * 80 - 6) * Math.PI / 14) / 2 + 1
}