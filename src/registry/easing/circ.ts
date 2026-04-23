import type { EaseFunction } from '@/types'

export const easeInCirc: EaseFunction = (t) => 1 - Math.sqrt(1 - t * t)
export const easeOutCirc: EaseFunction = (t) => { const t1 = t - 1; return Math.sqrt(1 - t1 * t1) }
export const easeInOutCirc: EaseFunction = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (t - 1) * (2 * t - 2) * (2 * t - 2) - 2 * (t - 1) * (2 * t - 2)) + 1) / 2