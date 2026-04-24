<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: { x: number, y: number }
  visible: boolean
  mode?: 'single' | 'double' | 'edit'
  startPoint?: { x: number, y: number }
  editTarget?: 'start' | 'end'
  otherPoint?: { x: number, y: number }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { x: number, y: number }]
  'update:visible': [value: boolean]
  'select-start': [value: { x: number, y: number }]
  'select-end': [value: { x: number, y: number }]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const precision = ref(0.5)
const mouseX = ref(0)
const mouseY = ref(0)
const showCoordinates = ref(true)
const hasSelectedStart = ref(false)
const startPoint = ref(props.startPoint || { x: 0, y: 0 })

const xMin = -10
const xMax = 10
const yMin = -10
const yMax = 10

watch(() => props.visible, (newVal) => {
  if (newVal) {
    mouseX.value = props.modelValue.x
    mouseY.value = props.modelValue.y
    hasSelectedStart.value = false
    if (props.startPoint) {
      startPoint.value = { ...props.startPoint }
      hasSelectedStart.value = true
    }
    if (props.mode === 'edit' && props.otherPoint) {
      hasSelectedStart.value = true
      startPoint.value = { ...props.otherPoint }
    }
  }
})

watch(() => props.startPoint, (newVal) => {
  if (newVal) {
    startPoint.value = { ...newVal }
    hasSelectedStart.value = true
  }
})

const snappedX = computed(() => {
  return Math.round(mouseX.value / precision.value) * precision.value
})

const snappedY = computed(() => {
  return Math.round(mouseY.value / precision.value) * precision.value
})

function getCanvasSize() {
  const canvas = canvasRef.value
  if (!canvas) return { width: 0, height: 0 }
  
  const rect = canvas.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

function drawGrid() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const { width, height } = getCanvasSize()
  const padding = 30
  
  canvas.width = width
  canvas.height = height
  
  ctx.clearRect(0, 0, width, height)
  
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  const centerX = width / 2
  const centerY = height / 2
  
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 2
  
  ctx.beginPath()
  ctx.moveTo(padding, centerY)
  ctx.lineTo(width - padding, centerY)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(centerX, padding)
  ctx.lineTo(centerX, height - padding)
  ctx.stroke()
  
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 2])
  
  // Draw grid lines at 0.5 intervals
  for (let x = xMin; x <= xMax; x += 0.5) {
    const px = centerX + (x / xRange) * (width - 2 * padding)
    // Highlight lines at integer positions
    if (Math.abs(x % 1) < 0.001) {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.setLineDash([])
    } else {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])
    }
    ctx.beginPath()
    ctx.moveTo(px, padding)
    ctx.lineTo(px, height - padding)
    ctx.stroke()
  }
  
  for (let y = yMin; y <= yMax; y += 0.5) {
    const py = centerY - (y / yRange) * (height - 2 * padding)
    // Highlight lines at integer positions
    if (Math.abs(y % 1) < 0.001) {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.setLineDash([])
    } else {
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])
    }
    ctx.beginPath()
    ctx.moveTo(padding, py)
    ctx.lineTo(width - padding, py)
    ctx.stroke()
  }
  
  ctx.setLineDash([])
  
  // Draw green recommended area box
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  
  const recommendedXMin = -8
  const recommendedXMax = 8
  const recommendedYMin = -8
  const recommendedYMax = 8
  
  const recLeft = centerX + (recommendedXMin / xRange) * (width - 2 * padding)
  const recTop = centerY - (recommendedYMax / yRange) * (height - 2 * padding)
  const recWidth = (recommendedXMax - recommendedXMin) / xRange * (width - 2 * padding)
  const recHeight = (recommendedYMax - recommendedYMin) / yRange * (height - 2 * padding)
  
  ctx.beginPath()
  ctx.rect(recLeft, recTop, recWidth, recHeight)
  ctx.stroke()
  ctx.setLineDash([])
  
  ctx.fillStyle = '#aaa'
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  
  // Draw labels at integer positions
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    const px = centerX + (x / xRange) * (width - 2 * padding)
    ctx.fillText(x.toString(), px, height - padding + 12)
  }
  
  ctx.textAlign = 'right'
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    const py = centerY - (y / yRange) * (height - 2 * padding)
    ctx.fillText(y.toString(), padding - 5, py + 3)
  }
  
  if (props.mode === 'edit' && props.otherPoint) {
    const otherX = props.otherPoint.x
    const otherY = props.otherPoint.y
    const otherDotX = centerX + (otherX / xRange) * (width - 2 * padding)
    const otherDotY = centerY - (otherY / yRange) * (height - 2 * padding)
    
    ctx.fillStyle = '#2196F3'
    ctx.beginPath()
    ctx.arc(otherDotX, otherDotY, 4, 0, Math.PI * 2)
    ctx.fill()
    
    const currentX = snappedX.value
    const currentY = snappedY.value
    const dotX = centerX + (currentX / xRange) * (width - 2 * padding)
    const dotY = centerY - (currentY / yRange) * (height - 2 * padding)
    
    ctx.strokeStyle = '#2196F3'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(otherDotX, otherDotY)
    ctx.lineTo(dotX, dotY)
    ctx.stroke()
  } else if (hasSelectedStart.value && props.mode === 'double') {
    const startX = startPoint.value.x
    const startY = startPoint.value.y
    const startDotX = centerX + (startX / xRange) * (width - 2 * padding)
    const startDotY = centerY - (startY / yRange) * (height - 2 * padding)
    
    const currentX = snappedX.value
    const currentY = snappedY.value
    const dotX = centerX + (currentX / xRange) * (width - 2 * padding)
    const dotY = centerY - (currentY / yRange) * (height - 2 * padding)
    
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(startDotX, startDotY)
    ctx.lineTo(dotX, dotY)
    ctx.stroke()
  }
  
  const currentX = snappedX.value
  const currentY = snappedY.value
  const dotX = centerX + (currentX / xRange) * (width - 2 * padding)
  const dotY = centerY - (currentY / yRange) * (height - 2 * padding)
  
  ctx.fillStyle = '#ff6b6b'
  ctx.beginPath()
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
  ctx.fill()
}

function handleMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const { width, height } = getCanvasSize()
  const padding = 30
  const centerX = width / 2
  const centerY = height / 2
  
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  
  const normalizedX = (x - centerX) / (width - 2 * padding) * xRange
  const normalizedY = (centerY - y) / (height - 2 * padding) * yRange
  
  mouseX.value = normalizedX
  mouseY.value = normalizedY
  
  mouseX.value = Math.max(xMin, Math.min(xMax, mouseX.value))
  mouseY.value = Math.max(yMin, Math.min(yMax, mouseY.value))
  
  showCoordinates.value = true
  drawGrid()
}

function handleMouseLeave() {
  drawGrid()
}

function handleClick() {
  const selectedPoint = { x: snappedX.value, y: snappedY.value }
  
  if (props.mode === 'double') {
    if (!hasSelectedStart.value) {
      startPoint.value = selectedPoint
      hasSelectedStart.value = true
      emit('select-start', selectedPoint)
      drawGrid()
    } else {
      emit('select-end', selectedPoint)
      emit('update:visible', false)
    }
  } else if (props.mode === 'edit') {
    if (props.editTarget === 'start') {
      emit('select-start', selectedPoint)
    } else {
      emit('select-end', selectedPoint)
    }
    emit('update:visible', false)
  } else {
    emit('update:modelValue', selectedPoint)
    emit('update:visible', false)
  }
}

function handleClose() {
  emit('update:visible', false)
}

function handlePrecisionChange(event: Event) {
  const target = event.target as HTMLInputElement
  precision.value = parseFloat(target.value) || 0.5
  drawGrid()
}

onMounted(() => {
  drawGrid()
})

onUnmounted(() => {
})
</script>

<template>
  <div v-if="visible" class="coordinate-picker-overlay">
    <div class="coordinate-picker">
      <div class="picker-header">
        <span>{{ mode === 'double' && !hasSelectedStart ? '选择 Start 坐标' : mode === 'double' && hasSelectedStart ? '选择 End 坐标' : '选择坐标' }}</span>
        <button @click="handleClose" class="close-btn">×</button>
      </div>
      <div class="picker-content">
        <div class="precision-control">
          <label>精度: </label>
          <input 
            type="number" 
            :value="precision" 
            @input="handlePrecisionChange"
            step="0.1"
            min="0.1"
            max="2"
            class="precision-input"
          />
        </div>
        <canvas 
          ref="canvasRef" 
          class="picker-canvas"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @click="handleClick"
        ></canvas>
        <div class="coordinate-display">
          坐标: ({{ snappedX.toFixed(2) }}, {{ snappedY.toFixed(2) }})
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.coordinate-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.coordinate-picker {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: 8px;
  width: 80vw;
  max-width: 960px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: $bg-primary;
  border-bottom: 1px solid $border;
  color: $text-primary;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: $text-primary;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  
  &:hover {
    color: $danger;
  }
}

.picker-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.precision-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $text-primary;
  font-size: $font-size-sm;
  
  label {
    white-space: nowrap;
  }
}

.precision-input {
  padding: 4px 8px;
  border: 1px solid $border;
  border-radius: 4px;
  background: $bg-primary;
  color: $text-primary;
  width: 80px;
  font-size: $font-size-sm;
}

.picker-canvas {
  flex: 1;
  width: 100%;
  background: $bg-canvas;
  border-radius: 4px;
  cursor: crosshair;
  
  /* Ensure 16:9 aspect ratio for the canvas */
  aspect-ratio: 16/9;
  max-height: 400px;
}

.coordinate-display {
  padding: 8px;
  background: $bg-primary;
  border: 1px solid $border;
  border-radius: 4px;
  color: $accent;
  font-family: monospace;
  text-align: center;
  font-size: $font-size-sm;
}
</style>