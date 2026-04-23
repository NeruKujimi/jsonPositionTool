import type { EaseEntry } from '@/types'
import { linear } from './linear'
import { easeInQuad, easeOutQuad, easeInOutQuad } from './quad'
import { easeInCubic, easeOutCubic, easeInOutCubic } from './cubic'
import { easeInQuart, easeOutQuart, easeInOutQuart } from './quart'
import { easeInQuint, easeOutQuint, easeInOutQuint } from './quint'
import { easeInSine, easeOutSine, easeInOutSine } from './sine'
import { easeInExpo, easeOutExpo, easeInOutExpo } from './expo'
import { easeInCirc, easeOutCirc, easeInOutCirc } from './circ'
import { easeInElastic, easeOutElastic, easeInOutElastic } from './elastic'
import { easeInBack, easeOutBack, easeInOutBack } from './back'
import { easeInBounce, easeOutBounce, easeInOutBounce } from './bounce'

type EaseRegistration = Map<string, EaseEntry>

const registry: EaseRegistration = new Map()

export function registerEase(name: string, category: string, fn: (t: number) => number): void {
  registry.set(name, { name, category, fn })
}

export function getEaseFunction(name: string): (t: number) => number {
  return registry.get(name)?.fn ?? ((t: number) => t)
}

export function getAllEaseNames(): string[] {
  return Array.from(registry.keys())
}

export function getEasesByCategory(category: string): EaseEntry[] {
  return Array.from(registry.values()).filter(e => e.category === category)
}

export function getCategoryList(): string[] {
  const cats = new Set<string>()
  for (const entry of registry.values()) {
    cats.add(entry.category)
  }
  return Array.from(cats)
}

// --- Register all built-in easing functions ---
registerEase('Linear', 'Basic', linear)

registerEase('EaseInQuad', 'Quad', easeInQuad)
registerEase('EaseOutQuad', 'Quad', easeOutQuad)
registerEase('EaseInOutQuad', 'Quad', easeInOutQuad)

registerEase('EaseInCubic', 'Cubic', easeInCubic)
registerEase('EaseOutCubic', 'Cubic', easeOutCubic)
registerEase('EaseInOutCubic', 'Cubic', easeInOutCubic)

registerEase('EaseInQuart', 'Quart', easeInQuart)
registerEase('EaseOutQuart', 'Quart', easeOutQuart)
registerEase('EaseInOutQuart', 'Quart', easeInOutQuart)

registerEase('EaseInQuint', 'Quint', easeInQuint)
registerEase('EaseOutQuint', 'Quint', easeOutQuint)
registerEase('EaseInOutQuint', 'Quint', easeInOutQuint)

registerEase('EaseInSine', 'Sine', easeInSine)
registerEase('EaseOutSine', 'Sine', easeOutSine)
registerEase('EaseInOutSine', 'Sine', easeInOutSine)

registerEase('EaseInExpo', 'Expo', easeInExpo)
registerEase('EaseOutExpo', 'Expo', easeOutExpo)
registerEase('EaseInOutExpo', 'Expo', easeInOutExpo)

registerEase('EaseInCirc', 'Circ', easeInCirc)
registerEase('EaseOutCirc', 'Circ', easeOutCirc)
registerEase('EaseInOutCirc', 'Circ', easeInOutCirc)

registerEase('EaseInElastic', 'Elastic', easeInElastic)
registerEase('EaseOutElastic', 'Elastic', easeOutElastic)
registerEase('EaseInOutElastic', 'Elastic', easeInOutElastic)

registerEase('EaseInBack', 'Back', easeInBack)
registerEase('EaseOutBack', 'Back', easeOutBack)
registerEase('EaseInOutBack', 'Back', easeInOutBack)

registerEase('EaseInBounce', 'Bounce', easeInBounce)
registerEase('EaseOutBounce', 'Bounce', easeOutBounce)
registerEase('EaseInOutBounce', 'Bounce', easeInOutBounce)