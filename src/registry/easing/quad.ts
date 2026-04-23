import type { EaseFunction } from '@/types'

export const easeInQuad: EaseFunction = (t) => t * t
export const easeOutQuad: EaseFunction = (t) => t * (2 - t)
export const easeInOutQuad: EaseFunction = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t