import type { EaseFunction } from '@/types'

export const easeInCubic: EaseFunction = (t) => t * t * t
export const easeOutCubic: EaseFunction = (t) => { const t1 = t - 1; return t1 * t1 * t1 + 1 }
export const easeInOutCubic: EaseFunction = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1