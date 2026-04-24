import { ref, computed } from 'vue'
import type { Segment } from '@/types'

let idCounter = 0

export function useSegments() {
  const segments = ref<Segment[]>([])

  function addSegment(opts?: Partial<Segment>) {
    const prev = segments.value.length > 0 ? segments.value[segments.value.length - 1] : null
    const seg: Segment = {
      id: idCounter++,
      startTime: opts?.startTime ?? (prev ? prev.endTime : 0),
      endTime: opts?.endTime ?? (prev ? prev.endTime + 1000 : 1000),
      startX: opts?.startX ?? (prev ? prev.endX : 0),
      startY: opts?.startY ?? (prev ? prev.endY : 0),
      endX: opts?.endX ?? (prev ? Math.min(Math.max(prev.endX + 2, -10), 10) : 2),
      endY: opts?.endY ?? (prev ? Math.min(Math.max(prev.endY, -10), 10) : 0),
      easeType: opts?.easeType ?? 'Linear',
      linked: opts?.linked ?? (!!prev),
    }
    segments.value.push(seg)
    propagateLink(seg)
  }

  function removeSegment(id: number) {
    const idx = segments.value.findIndex(s => s.id === id)
    if (idx === -1) return
    
    // const removedSeg = segments.value[idx]!
    
    // Check if we need to unlink adjacent segments
    const hasPrev = idx > 0
    const hasNext = idx < segments.value.length - 1
    
    // If the removed segment was linked, and there are segments before and after,
    // we need to check if we should unlink the next segment
    if (hasPrev && hasNext) {
      const nextSeg = segments.value[idx + 1]!
      if (nextSeg.linked) {
        // Unlink the next segment since its previous is being removed
        nextSeg.linked = false
      }
    }
    
    segments.value.splice(idx, 1)
  }

  function updateField(id: number, field: keyof Segment, value: number | string | boolean) {
    const seg = segments.value.find(s => s.id === id)
    if (!seg) return
    ;(seg as Record<string, unknown>)[field] = value
    
    // If modifying start coordinates and linked, update previous segment's end coordinates
    if (seg.linked && (field === 'startX' || field === 'startY' || field === 'startTime')) {
      const idx = segments.value.indexOf(seg)
      if (idx > 0) {
        const prev = segments.value[idx - 1]!
        if (field === 'startX') prev.endX = seg.startX
        if (field === 'startY') prev.endY = seg.startY
        if (field === 'startTime') prev.endTime = seg.startTime
      }
    }
    
    // If modifying end coordinates, propagate to next linked segments
    if (field === 'endTime' || field === 'endX' || field === 'endY') {
      propagateLink(seg)
    }
  }

  function toggleLinked(id: number, linked: boolean) {
    const seg = segments.value.find(s => s.id === id)
    if (!seg) return
    seg.linked = linked
    if (seg.linked) {
      const idx = segments.value.indexOf(seg)
      if (idx > 0) {
        const prev = segments.value[idx - 1]!
        seg.startTime = prev.endTime
        seg.startX = prev.endX
        seg.startY = prev.endY
      }
    }
  }

  function propagateLink(changedSeg: Segment) {
    const idx = segments.value.indexOf(changedSeg)
    for (let i = idx + 1; i < segments.value.length; i++) {
      const seg = segments.value[i]!
      if (seg.linked) {
        const prev = segments.value[i - 1]!
        seg.startTime = prev.endTime
        seg.startX = prev.endX
        seg.startY = prev.endY
      } else {
        break
      }
    }
  }

  function parseJson(json: any[], timeUnit: 'milliseconds' | 'seconds' = 'milliseconds') {
    segments.value = json.map((item, index) => {
      // Handle different JSON formats
      let startTime = 0
      let endTime = 1000
      let startX = 0
      let startY = 0
      let endX = 200
      let endY = 0
      let easeType = 'Linear'
      let linked = index > 0

      // Standard format
      if (item.startTime !== undefined) {
        let timeValue = typeof item.startTime === 'string' ? parseFloat(item.startTime) : item.startTime
        // Convert to milliseconds if needed
        if (timeUnit === 'seconds') {
          timeValue *= 1000
        }
        startTime = timeValue
      }
      if (item.endTime !== undefined) {
        let timeValue = typeof item.endTime === 'string' ? parseFloat(item.endTime) : item.endTime
        // Convert to milliseconds if needed
        if (timeUnit === 'seconds') {
          timeValue *= 1000
        }
        endTime = timeValue
      }
      if (item.startX !== undefined) {
        startX = Math.min(Math.max(item.startX, -10), 10)
      }
      if (item.startY !== undefined) {
        startY = Math.min(Math.max(item.startY, -10), 10)
      }
      if (item.endX !== undefined) {
        endX = Math.min(Math.max(item.endX, -10), 10)
      }
      if (item.endY !== undefined) {
        endY = Math.min(Math.max(item.endY, -10), 10)
      }
      if (item.easeType !== undefined) {
        easeType = item.easeType
      }
      if (item.linked !== undefined) {
        linked = item.linked
      }
      if (item.followPrevious !== undefined) {
        linked = item.followPrevious
      }

      // Alternative format with startPos/endPos
      if (item.startPos) {
        startX = item.startPos.x ?? startX
        startY = item.startPos.y ?? startY
      }
      if (item.endPos) {
        endX = item.endPos.x ?? endX
        endY = item.endPos.y ?? endY
      }

      // Alternative format with easeType under position
      if (item.type === 'position' && item.easeType) {
        easeType = item.easeType
      }

      return {
        id: idCounter++,
        startTime,
        endTime,
        startX,
        startY,
        endX,
        endY,
        easeType,
        linked,
      }
    })
  }

  const maxEndTime = computed(() => {
    if (segments.value.length === 0) return 0
    return Math.max(...segments.value.map(s => s.endTime))
  })

  function mirrorHorizontal(ids?: number[]) {
    const targetIds = ids ?? segments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX = -seg.startX
        seg.endX = -seg.endX
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          // 取消当前事件的链接
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          // 取消下一个事件的链接
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  function mirrorVertical(ids?: number[]) {
    const targetIds = ids ?? segments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startY = -seg.startY
        seg.endY = -seg.endY
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          // 取消当前事件的链接
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          // 取消下一个事件的链接
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  function mirrorDiagonal(ids?: number[]) {
    const targetIds = ids ?? segments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX = -seg.startX
        seg.startY = -seg.startY
        seg.endX = -seg.endX
        seg.endY = -seg.endY
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          // 取消当前事件的链接
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          // 取消下一个事件的链接
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  function rotate(angle: number, rotationCenter: 'start' | 'center' | 'end' = 'center', ids?: number[]) {
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    
    // 全局路径旋转：以第一个事件的起点为旋转中心
    if (!ids) {
      const allIds = segments.value.map(s => s.id)
      if (allIds.length === 0) return
      
      // 使用第一个事件的起点作为全局旋转中心
      const firstSeg = segments.value[0]
      if (!firstSeg) return
      
      const cx = firstSeg.startX
      const cy = firstSeg.startY
      
      // 对所有事件应用旋转
      segments.value.forEach(seg => {
        // Rotate start point
        const startDx = seg.startX - cx
        const startDy = seg.startY - cy
        const newStartX = cx + (startDx * cos - startDy * sin)
        const newStartY = cy + (startDx * sin + startDy * cos)
        
        // Rotate end point
        const endDx = seg.endX - cx
        const endDy = seg.endY - cy
        const newEndX = cx + (endDx * cos - endDy * sin)
        const newEndY = cy + (endDx * sin + endDy * cos)
        
        seg.startX = Math.min(Math.max(parseFloat(newStartX.toFixed(2)), -10), 10)
        seg.startY = Math.min(Math.max(parseFloat(newStartY.toFixed(2)), -10), 10)
        seg.endX = Math.min(Math.max(parseFloat(newEndX.toFixed(2)), -10), 10)
        seg.endY = Math.min(Math.max(parseFloat(newEndY.toFixed(2)), -10), 10)
      })
      return
    }
    
    // 单个/多个事件旋转：基于每个事件的中心或指定的旋转中心
    const targetIds = ids
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        let cx = 0
        let cy = 0
        
        switch (rotationCenter) {
          case 'start':
            cx = seg.startX
            cy = seg.startY
            break
          case 'end':
            cx = seg.endX
            cy = seg.endY
            break
          case 'center':
          default:
            cx = (seg.startX + seg.endX) / 2
            cy = (seg.startY + seg.endY) / 2
            break
        }
        
        const startDx = seg.startX - cx
        const startDy = seg.startY - cy
        const newStartX = cx + (startDx * cos - startDy * sin)
        const newStartY = cy + (startDx * sin + startDy * cos)
        
        const endDx = seg.endX - cx
        const endDy = seg.endY - cy
        const newEndX = cx + (endDx * cos - endDy * sin)
        const newEndY = cy + (endDx * sin + endDy * cos)
        
        seg.startX = Math.min(Math.max(parseFloat(newStartX.toFixed(2)), -10), 10)
        seg.startY = Math.min(Math.max(parseFloat(newStartY.toFixed(2)), -10), 10)
        seg.endX = Math.min(Math.max(parseFloat(newEndX.toFixed(2)), -10), 10)
        seg.endY = Math.min(Math.max(parseFloat(newEndY.toFixed(2)), -10), 10)
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  function translate(dx: number, dy: number, ids?: number[]) {
    const targetIds = ids ?? segments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX += dx
        seg.startY += dy
        seg.endX += dx
        seg.endY += dy
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          // 取消当前事件的链接
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          // 取消下一个事件的链接
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  function scale(sx: number, sy: number, ids?: number[]) {
    const targetIds = ids ?? segments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX *= sx
        seg.startY *= sy
        seg.endX *= sx
        seg.endY *= sy
      }
    })
    
    // 取消当前事件和下一个事件的链接
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const idx = segments.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          // 取消当前事件的链接
          const currentSeg = segments.value[idx]
          if (currentSeg) {
            currentSeg.linked = false
          }
          // 取消下一个事件的链接
          if (idx < segments.value.length - 1) {
            const nextSeg = segments.value[idx + 1]
            if (nextSeg) {
              nextSeg.linked = false
            }
          }
        }
      })
    }
  }

  return {
    segments,
    addSegment,
    removeSegment,
    updateField,
    toggleLinked,
    maxEndTime,
    parseJson,
    mirrorHorizontal,
    mirrorVertical,
    mirrorDiagonal,
    rotate,
    translate,
    scale,
  }
}