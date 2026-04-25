import { ref, computed } from 'vue'
import type { Segment, SegmentGroup } from '@/types'

let idCounter = 0
let groupIdCounter = 0

export function useSegments() {
  const segments = ref<Segment[]>([])
  const groups = ref<SegmentGroup[]>([])
  const activeGroupId = ref<number | null>(null)

  function addSegment(opts?: Partial<Segment>) {
    const prev = segments.value.length > 0 ? segments.value[segments.value.length - 1] : null
    const prevDuration = prev ? prev.endTime - prev.startTime : 1000
    const seg: Segment = {
      id: idCounter++,
      startTime: opts?.startTime ?? (prev ? prev.endTime : 0),
      endTime: opts?.endTime ?? (prev ? prev.endTime + prevDuration : 1000),
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
    
    // 从所有分组中移除该事件
    groups.value.forEach(group => {
      group.segmentIds = group.segmentIds.filter(sid => sid !== id)
    })
    
    const hasPrev = idx > 0
    const hasNext = idx < segments.value.length - 1
    
    if (hasPrev && hasNext) {
      const nextSeg = segments.value[idx + 1]!
      if (nextSeg.linked) {
        nextSeg.linked = false
      }
    }
    
    segments.value.splice(idx, 1)
  }

  function updateField(id: number, field: keyof Segment, value: number | string | boolean) {
    const seg = segments.value.find(s => s.id === id)
    if (!seg) return
    ;(seg as Record<string, unknown>)[field] = value
    
    if (seg.linked && (field === 'startX' || field === 'startY' || field === 'startTime')) {
      const idx = segments.value.indexOf(seg)
      if (idx > 0) {
        const prev = segments.value[idx - 1]!
        if (field === 'startX') prev.endX = seg.startX
        if (field === 'startY') prev.endY = seg.startY
        if (field === 'startTime') prev.endTime = seg.startTime
      }
    }
    
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

  function createGroup(name: string, segmentIds: number[]) {
    const group: SegmentGroup = {
      id: groupIdCounter++,
      name,
      expanded: true,
      segmentIds,
    }
    groups.value.push(group)
    // 更新 segment 的 groupId
    segmentIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) seg.groupId = group.id
    })
  }

  function deleteGroup(groupId: number) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    // 清除 segment 的 groupId
    group.segmentIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) seg.groupId = undefined
    })
    const idx = groups.value.findIndex(g => g.id === groupId)
    if (idx !== -1) groups.value.splice(idx, 1)
    if (activeGroupId.value === groupId) {
      activeGroupId.value = null
    }
  }

  function updateGroup(groupId: number, updates: Partial<SegmentGroup>) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    Object.assign(group, updates)
  }

  function addSegmentsToGroup(groupId: number, segmentIds: number[]) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.segmentIds = [...new Set([...group.segmentIds, ...segmentIds])]
    segmentIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) seg.groupId = groupId
    })
  }

  function removeSegmentsFromGroup(groupId: number, segmentIds: number[]) {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    group.segmentIds = group.segmentIds.filter(id => !segmentIds.includes(id))
    segmentIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) seg.groupId = undefined
    })
  }

  function toggleGroupExpand(groupId: number) {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.expanded = !group.expanded
    }
  }

  function setActiveGroup(groupId: number | null) {
    activeGroupId.value = groupId
  }

  function getGroupSegments(groupId: number): Segment[] {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return []
    return segments.value.filter(s => group.segmentIds.includes(s.id))
  }

  function loadSegmentsFromData(data: Segment[], groupsData: SegmentGroup[]) {
    segments.value = data
    groups.value = groupsData
    const maxId = data.reduce((max, s) => Math.max(max, s.id), -1)
    idCounter = maxId + 1
    const maxGroupId = groupsData.reduce((max, g) => Math.max(max, g.id), -1)
    groupIdCounter = maxGroupId + 1
  }

  function resetAll() {
    segments.value = []
    groups.value = []
    activeGroupId.value = null
    idCounter = 0
    groupIdCounter = 0
  }

  const visibleSegments = computed(() => {
    if (activeGroupId.value !== null) {
      return getGroupSegments(activeGroupId.value)
    }
    return segments.value
  })

  const maxEndTime = computed(() => {
    if (visibleSegments.value.length === 0) return 0
    return Math.max(...visibleSegments.value.map(s => s.endTime))
  })

  function parseJson(json: any[], timeUnit: 'milliseconds' | 'seconds' = 'milliseconds') {
    segments.value = json.map((item, index) => {
      let startTime = 0
      let endTime = 1000
      let startX = 0
      let startY = 0
      let endX = 200
      let endY = 0
      let easeType = 'Linear'
      let linked = index > 0

      if (item.startTime !== undefined) {
        let timeValue = typeof item.startTime === 'string' ? parseFloat(item.startTime) : item.startTime
        if (timeUnit === 'seconds') {
          timeValue *= 1000
        }
        startTime = timeValue
      }
      if (item.endTime !== undefined) {
        let timeValue = typeof item.endTime === 'string' ? parseFloat(item.endTime) : item.endTime
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

      if (item.startPos) {
        startX = item.startPos.x ?? startX
        startY = item.startPos.y ?? startY
      }
      if (item.endPos) {
        endX = item.endPos.x ?? endX
        endY = item.endPos.y ?? endY
      }

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

  function mirrorHorizontal(ids?: number[]) {
    const targetIds = ids ?? visibleSegments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX = -seg.startX
        seg.endX = -seg.endX
      }
    })
    
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

  function mirrorVertical(ids?: number[]) {
    const targetIds = ids ?? visibleSegments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startY = -seg.startY
        seg.endY = -seg.endY
      }
    })
    
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

  function mirrorDiagonal(ids?: number[]) {
    const targetIds = ids ?? visibleSegments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX = -seg.startX
        seg.startY = -seg.startY
        seg.endX = -seg.endX
        seg.endY = -seg.endY
      }
    })
    
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

  function rotate(angle: number, rotationCenter: 'start' | 'center' | 'end' = 'center', ids?: number[]) {
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    
    if (!ids) {
      const allIds = visibleSegments.value.map(s => s.id)
      if (allIds.length === 0) return
      
      const firstSeg = visibleSegments.value[0]
      if (!firstSeg) return
      
      const cx = firstSeg.startX
      const cy = firstSeg.startY
      
      visibleSegments.value.forEach(seg => {
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
      })
      return
    }
    
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
    const targetIds = ids ?? visibleSegments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX += dx
        seg.startY += dy
        seg.endX += dx
        seg.endY += dy
      }
    })
    
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

  function scale(sx: number, sy: number, ids?: number[]) {
    const targetIds = ids ?? visibleSegments.value.map(s => s.id)
    targetIds.forEach(id => {
      const seg = segments.value.find(s => s.id === id)
      if (seg) {
        seg.startX *= sx
        seg.startY *= sy
        seg.endX *= sx
        seg.endY *= sy
      }
    })
    
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

  return {
    segments,
    groups,
    activeGroupId,
    visibleSegments,
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
    createGroup,
    deleteGroup,
    updateGroup,
    addSegmentsToGroup,
    removeSegmentsFromGroup,
    toggleGroupExpand,
    setActiveGroup,
    getGroupSegments,
    loadSegmentsFromData,
    resetAll,
  }
}
