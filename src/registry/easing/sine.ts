import type { EaseFunction } from '@/types'

export const easeInSine: EaseFunction = (t) => 1 - Math.cos(t * Math.PI / 2)
export const easeOutSine: EaseFunction = (t) => Math.sin(t * Math.PI / 2)
export const easeInOutSine: EaseFunction = (t) => (1 - Math.cos(Math.PI * t)) / 2