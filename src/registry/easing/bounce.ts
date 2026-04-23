import type { EaseFunction } from '@/types'

export const easeOutBounce: EaseFunction = (t) => {
  if (t < 1 / 2.75) return 7.5625 * t * t
  if (t < 2 / 2.75) { const t1 = t - 1.5 / 2.75; return 7.5625 * t1 * t1 + 0.75 }
  if (t < 2.5 / 2.75) { const t1 = t - 2.25 / 2.75; return 7.5625 * t1 * t1 + 0.9375 }
  const t1 = t - 2.625 / 2.75
  return 7.5625 * t1 * t1 + 0.984375
}

export const easeInBounce: EaseFunction = (t) => 1 - easeOutBounce(1 - t)

export const easeInOutBounce: EaseFunction = (t) =>
  t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2