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

function render() {
  draw(props.segments, props.currentTime, props.maxTime, props.getPointAtTime)
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

.preview-canvas {
  flex: 1;
  width: 100%;
  background: $bg-canvas;
  cursor: crosshair;
}
</style>