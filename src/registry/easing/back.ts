import type { EaseFunction } from '@/types'

const S1 = 1.70158
const S2 = S1 * 1.525

export const easeInBack: EaseFunction = (t) => {
  const s = S1
  return t * t * ((s + 1) * t - s)
}

export const easeOutBack: EaseFunction = (t) => {
  const s = S1
  const t1 = t - 1
  return 1 + (t1) * (t1) * ((s + 1) * t1 + s) 
}

export const easeInOutBack: EaseFunction = (t) => {
  const s = S2
  return t < 0.5
    ? (2 * t) * (2 * t) * ((s + 1) * 2 * t - s) / 2
    : ((2 * t - 2) * (2 * t - 2) * ((s + 1) * (2 * t - 2) + s) + 2) / 2
}