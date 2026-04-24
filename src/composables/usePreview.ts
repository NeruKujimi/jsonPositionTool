import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type { Segment } from '@/types'
import { getEaseFunction } from '@/registry/easing'

const PATH_COLORS = [
  '#00d4ff', '#ff6b6b', '#ffd93d', '#6bff6b',
  '#d46bff', '#ff6bb5', '#6bffd4', '#ffaa6b',
]

export function usePreview(canvasRef: Ref<HTMLCanvasElement | null>) {
  const ctx = ref<CanvasRenderingContext2D | null>(null)

  function resizeCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    const c = canvas.getContext('2d')
    if (c) {
      c.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      ctx.value = c
    }
  }

  function draw(
    segments: Segment[],
    currentTime: number,
    _maxTime: number,
    getPointAtTime: (segments: Segment[], time: number) => { x: number; y: number },
  ) {
    const canvas = canvasRef.value
    if (!canvas) return
    const c = ctx.value
    if (!c) return

    const w = canvas.width / devicePixelRatio
    const h = canvas.height / devicePixelRatio
    c.clearRect(0, 0, w, h)

    if (segments.length === 0) {
      c.fillStyle = '#555'
      c.font = '14px Segoe UI'
      c.textAlign = 'center'
      c.fillText('Add segments to preview', w / 2, h / 2)
      return
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const s of segments) {
      for (const v of [s.startX, s.endX]) { if (v < minX) minX = v; if (v > maxX) maxX = v }
      for (const v of [s.startY, s.endY]) { if (v < minY) minY = v; if (v > maxY) maxY = v }
    }

    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    const padding = 50
    const scaleX = (w - padding * 2) / rangeX
    const scaleY = (h - padding * 2) / rangeY
    const scale = Math.min(scaleX, scaleY)
    const offX = (w - rangeX * scale) / 2 - minX * scale
    const offY = (h - rangeY * scale) / 2 + (rangeY * scale) / 2 + minY * scale - rangeY * scale

    const toCanvas = (x: number, y: number) => ({
      cx: x * scale + offX,
      cy: -(y * scale) + offY,
    })

    const allPts: { cx: number; cy: number }[] = []
    for (const s of segments) {
      allPts.push(toCanvas(s.startX, s.startY))
      allPts.push(toCanvas(s.endX, s.endY))
    }

    const cMinX = Math.min(...allPts.map(p => p.cx))
    const cMaxX = Math.max(...allPts.map(p => p.cx))
    const cMinY = Math.min(...allPts.map(p => p.cy))
    const cMaxY = Math.max(...allPts.map(p => p.cy))

    const cxOff = (w - (cMaxX - cMinX)) / 2 - cMinX
    const cyOff = (h - (cMaxY - cMinY)) / 2 - cMinY

    const transformPt = (x: number, y: number) => {
      const p = toCanvas(x, y)
      return { cx: p.cx + cxOff, cy: p.cy + cyOff }
    }

    // Grid
    c.strokeStyle = '#ffffff0a'
    c.lineWidth = 1
    const gridStepX = Math.max(1, Math.floor(rangeX / 10))
    for (let gx = Math.floor(minX); gx <= Math.ceil(maxX); gx += gridStepX) {
      const p = transformPt(gx, 0)
      c.beginPath(); c.moveTo(p.cx, 0); c.lineTo(p.cx, h); c.stroke()
    }
    const gridStepY = Math.max(1, Math.floor(rangeY / 10))
    for (let gy = Math.floor(minY); gy <= Math.ceil(maxY); gy += gridStepY) {
      const p = transformPt(0, gy)
      c.beginPath(); c.moveTo(0, p.cy); c.lineTo(w, p.cy); c.stroke()
    }

    // Paths
    segments.forEach((s, i) => {
      const startP = transformPt(s.startX, s.startY)
      const endP = transformPt(s.endX, s.endY)
      const duration = s.endTime - s.startTime
      const steps = Math.max(30, Math.abs(duration) / 10)

      c.beginPath()
      for (let j = 0; j <= steps; j++) {
        const t = j / steps
        const eased = getEaseFunction(s.easeType)(t)
        const px = s.startX + (s.endX - s.startX) * eased
        const py = s.startY + (s.endY - s.startY) * eased
        const p = transformPt(px, py)
        if (j === 0) c.moveTo(p.cx, p.cy)
        else c.lineTo(p.cx, p.cy)
      }
      const color = PATH_COLORS[i % PATH_COLORS.length]!
      c.strokeStyle = color + '88'
      c.lineWidth = 2
      c.stroke()

      // Dots
      c.fillStyle = color
      c.beginPath(); c.arc(startP.cx, startP.cy, 3, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(endP.cx, endP.cy, 3, 0, Math.PI * 2); c.fill()

      // Label
      c.fillStyle = '#ffffff66'
      c.font = '10px Segoe UI'
      c.fillText(`S${i + 1}`, startP.cx + 5, startP.cy - 5)
    })

    // Current position
    const pt = getPointAtTime(segments, currentTime)
    const curP = transformPt(pt.x, pt.y)

    // Trail
    const trailTime = Math.max(0, currentTime - 150)
    c.beginPath()
    let first = true
    for (let tt = trailTime; tt <= currentTime; tt += 5) {
      const tp = getPointAtTime(segments, tt)
      const tcp = transformPt(tp.x, tp.y)
      if (first) { c.moveTo(tcp.cx, tcp.cy); first = false }
      else c.lineTo(tcp.cx, tcp.cy)
    }
    c.strokeStyle = '#00d4ff88'
    c.lineWidth = 3
    c.stroke()

    // Moving dot
    c.beginPath()
    c.arc(curP.cx, curP.cy, 7, 0, Math.PI * 2)
    c.fillStyle = '#00d4ff'
    c.fill()
    c.strokeStyle = '#fff'
    c.lineWidth = 2
    c.stroke()

    // Coordinates label
    c.fillStyle = '#fff'
    c.font = '10px Consolas'
    c.fillText(`(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`, curP.cx + 12, curP.cy - 12)
  }

  onMounted(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
  })

  return { resizeCanvas, draw }
}