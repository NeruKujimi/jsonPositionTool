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

registerEase('InQuad', 'Quad', easeInQuad)
registerEase('OutQuad', 'Quad', easeOutQuad)
registerEase('InOutQuad', 'Quad', easeInOutQuad)

registerEase('InCubic', 'Cubic', easeInCubic)
registerEase('OutCubic', 'Cubic', easeOutCubic)
registerEase('InOutCubic', 'Cubic', easeInOutCubic)

registerEase('InQuart', 'Quart', easeInQuart)
registerEase('OutQuart', 'Quart', easeOutQuart)
registerEase('InOutQuart', 'Quart', easeInOutQuart)

registerEase('InQuint', 'Quint', easeInQuint)
registerEase('OutQuint', 'Quint', easeOutQuint)
registerEase('InOutQuint', 'Quint', easeInOutQuint)

registerEase('InSine', 'Sine', easeInSine)
registerEase('OutSine', 'Sine', easeOutSine)
registerEase('InOutSine', 'Sine', easeInOutSine)

registerEase('InExpo', 'Expo', easeInExpo)
registerEase('OutExpo', 'Expo', easeOutExpo)
registerEase('InOutExpo', 'Expo', easeInOutExpo)

registerEase('InCirc', 'Circ', easeInCirc)
registerEase('OutCirc', 'Circ', easeOutCirc)
registerEase('InOutCirc', 'Circ', easeInOutCirc)

registerEase('InElastic', 'Elastic', easeInElastic)
registerEase('OutElastic', 'Elastic', easeOutElastic)
registerEase('InOutElastic', 'Elastic', easeInOutElastic)

registerEase('InBack', 'Back', easeInBack)
registerEase('OutBack', 'Back', easeOutBack)
registerEase('InOutBack', 'Back', easeInOutBack)

registerEase('InBounce', 'Bounce', easeInBounce)
registerEase('OutBounce', 'Bounce', easeOutBounce)
registerEase('InOutBounce', 'Bounce', easeInOutBounce)