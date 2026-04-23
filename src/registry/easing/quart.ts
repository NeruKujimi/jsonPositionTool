import type { EaseFunction } from '@/types'

export const easeInQuart: EaseFunction = (t) => t * t * t * t
export const easeOutQuart: EaseFunction = (t) => { const t1 = t - 1; return 1 - t1 * t1 * t1 * t1 }
export const easeInOutQuart: EaseFunction = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (t - 1) * (t - 1) * (t - 1) * (t - 1)