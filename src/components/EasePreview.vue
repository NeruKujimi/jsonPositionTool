<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { getEaseFunction } from '@/registry/easing'

const props = defineProps<{
  easeName: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationProgress = ref(0)
const isPlaying = ref(false)
let animationId: number | null = null
let startTime: number | null = null

function drawCurve() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const width = canvas.width
  const height = canvas.height
  const padding = 20
  
  ctx.clearRect(0, 0, width, height)
  
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 1
  
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.stroke()
  
  const easeFn = getEaseFunction(props.easeName)
  
  ctx.strokeStyle = '#4a9'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const easedT = easeFn(t)
    const x = padding + t * (width - 2 * padding)
    const y = height - padding - easedT * (height - 2 * padding)
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
  
  const progressX = padding + animationProgress.value * (width - 2 * padding)
  const progressY = height - padding - easeFn(animationProgress.value) * (height - 2 * padding)
  
  ctx.fillStyle = '#ff6b6b'
  ctx.beginPath()
  ctx.arc(progressX, progressY, 6, 0, Math.PI * 2)
  ctx.fill()
}

function animate(timestamp: number) {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const duration = 2000
  
  animationProgress.value = Math.min(elapsed / duration, 1)
  drawCurve()
  
  if (animationProgress.value < 1 && isPlaying.value) {
    animationId = requestAnimationFrame(animate)
  } else if (animationProgress.value >= 1) {
    isPlaying.value = false
    startTime = null
  }
}

function togglePlay() {
  if (isPlaying.value) {
    isPlaying.value = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    startTime = null
  } else {
    if (animationProgress.value >= 1) {
      animationProgress.value = 0
    }
    isPlaying.value = true
    startTime = null
    animationId = requestAnimationFrame(animate)
  }
}

function reset() {
  isPlaying.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  startTime = null
  animationProgress.value = 0
  drawCurve()
}

watch(() => props.easeName, () => {
  reset()
})

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = 200
    canvas.height = 150
  }
  drawCurve()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div class="ease-preview">
    <div class="preview-title">{{ easeName }}</div>
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
    <div class="preview-controls">
      <button @click="togglePlay" class="control-btn">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button @click="reset" class="control-btn">Reset</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.ease-preview {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: 4px;
  padding: 10px;
  margin-top: 8px;
}

.preview-title {
  font-size: $font-size-sm;
  color: $accent;
  margin-bottom: 8px;
  text-align: center;
}

.preview-canvas {
  display: block;
  margin: 0 auto;
  background: $bg-canvas;
  border-radius: 4px;
}

.preview-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.control-btn {
  padding: 4px 12px;
  font-size: $font-size-sm;
  background: $accent;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: darken($accent, 10%);
  }
}
</style>
