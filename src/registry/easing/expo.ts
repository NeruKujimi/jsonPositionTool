import type { EaseFunction } from '@/types'

export const easeInExpo: EaseFunction = (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
export const easeOutExpo: EaseFunction = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const easeInOutExpo: EaseFunction = (t) => {
  if (t === 0 || t === 1) return t
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2
}