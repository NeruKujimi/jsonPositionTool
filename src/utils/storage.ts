import type { Segment } from '@/types'
import type { SegmentGroup } from '@/types'

export interface SavedState {
  segments: Segment[]
  groups: SegmentGroup[]
  bpm: number
  useBpmMode: boolean
  version: number
}

const STORAGE_KEY = 'json-position-tool-state'
const CURRENT_VERSION = 1

export function saveState(segments: Segment[], groups: SegmentGroup[], bpm: number, useBpmMode: boolean): void {
  try {
    const state: SavedState = {
      segments,
      groups,
      bpm,
      useBpmMode,
      version: CURRENT_VERSION,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function loadState(): SavedState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return JSON.parse(saved) as SavedState
  } catch (e) {
    console.error('Failed to load state:', e)
    return null
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear state:', e)
  }
}

export function hasSavedState(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}
