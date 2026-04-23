import type { EaseFunction } from '@/types'

export const easeInQuint: EaseFunction = (t) => t * t * t * t * t
export const easeOutQuint: EaseFunction = (t) => { const t1 = t - 1; return 1 + t1 * t1 * t1 * t1 * t1 }
export const easeInOutQuint: EaseFunction = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (t - 1) * (t - 1) * (t - 1) * (t - 1) * (t - 1)