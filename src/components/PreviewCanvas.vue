<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Segment } from '@/types'
import { usePreview } from '@/composables/usePreview'

const props = defineProps<{
  segments: Segment[]
  currentTime: number
  maxTime: number
  getPointAtTime: (segments: Segment[], time: number) => { x: number; y: number }
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { resizeCanvas, draw } = usePreview(canvasRef)

const timeInput = ref<string>('0')
const coordinates = ref<{ x: number; y: number } | null>(null)

function render() {
  draw(props.segments, props.currentTime, props.maxTime, props.getPointAtTime)
}

function getCoordinates() {
  const time = parseFloat(timeInput.value)
  if (!isNaN(time)) {
    coordinates.value = props.getPointAtTime(props.segments, time)
  }
}

watch(
  () => [props.segments, props.currentTime, props.maxTime],
  () => requestAnimationFrame(render),
  { deep: true }
)

onMounted(() => {
  resizeCanvas()
  render()
})
</script>

<template>
  <div class="preview-section">
    <div class="section-title">
      <span>Preview</span>
    </div>
    <div class="time-input-section">
      <input 
        v-model="timeInput" 
        type="number" 
        placeholder="Enter time" 
        class="time-input"
      />
      <button @click="getCoordinates" class="get-coordinates-btn">
        Get Coordinates
      </button>
      <div v-if="coordinates" class="coordinates-display">
        Coordinates: ({{ coordinates.x.toFixed(2) }}, {{ coordinates.y.toFixed(2) }})
      </div>
    </div>
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 2px solid $border;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-secondary;
  padding: 8px 14px;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;
}

.time-input-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: $bg-primary;
  border-bottom: 1px solid $border;
  flex-wrap: wrap;
}

.time-input {
  padding: 6px 10px;
  border: 1px solid $border;
  border-radius: 4px;
  background: $bg-secondary;
  color: $text-primary;
  width: 120px;
  font-size: $font-size-md;
}

.get-coordinates-btn {
  padding: 6px 14px;
  background: $accent;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: $font-size-md;
  transition: background 0.2s;
  
  &:hover {
    background: darken($accent, 10%);
  }
}

.coordinates-display {
  margin-left: auto;
  font-size: $font-size-md;
  color: $text-primary;
  font-family: monospace;
}

.preview-canvas {
  flex: 1;
  width: 100%;
  background: $bg-canvas;
  cursor: crosshair;
}
</style>