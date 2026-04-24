<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Segment } from '@/types'
import { usePreview } from '@/composables/usePreview'

const props = defineProps<{
  segments: Segment[]
  currentTime: number
  maxTime: number
  getPointAtTime: (segments: Segment[], time: number) => { x: number; y: number }
  useBpmMode: boolean
  bpm: number
}>()

const emit = defineEmits<{
  'time-change': [value: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { resizeCanvas, draw } = usePreview(canvasRef)

const timeInput = ref<string>('0')
const coordinates = ref<{ x: number; y: number } | null>(null)

function render() {
  draw(props.segments, props.currentTime, props.maxTime, props.getPointAtTime)
}

function getCoordinates() {
  let time = parseFloat(timeInput.value)
  if (!isNaN(time)) {
    // 如果是BPM模式，将拍数转换为毫秒
    if (props.useBpmMode) {
      const msPerBeat = 60000 / props.bpm
      time = time * msPerBeat
    }
    coordinates.value = props.getPointAtTime(props.segments, time)
  }
}

watch(
  () => [props.segments, props.currentTime, props.maxTime],
  () => requestAnimationFrame(render),
  { deep: true }
)

// 监听BPM模式切换，根据输入框的值重新获取时间节点
watch(() => props.useBpmMode, () => {
  // 当BPM模式切换时，转换输入框的时间值
  if (timeInput.value) {
    const time = parseFloat(timeInput.value)
    if (!isNaN(time)) {
      if (props.useBpmMode) {
        // 非BPM模式转BPM模式：毫秒 -> 节拍
        const msPerBeat = 60000 / props.bpm
        timeInput.value = (time / msPerBeat).toFixed(2)
      } else {
        // BPM模式转非BPM模式：节拍 -> 毫秒
        const msPerBeat = 60000 / props.bpm
        timeInput.value = (time * msPerBeat).toFixed(0)
      }
      getCoordinates()
    }
  }
})

// 监听输入框值变化，更新滑块和预览时间
watch(timeInput, () => {
  const time = parseFloat(timeInput.value)
  if (!isNaN(time)) {
    let msTime = time
    if (props.useBpmMode) {
      const msPerBeat = 60000 / props.bpm
      msTime = time * msPerBeat
    }
    emit('time-change', msTime)
  }
})

// 监听currentTime变化，同步更新输入框值
watch(() => props.currentTime, (newTime) => {
  if (props.useBpmMode) {
    const msPerBeat = 60000 / props.bpm
    timeInput.value = (newTime / msPerBeat).toFixed(2)
  } else {
    timeInput.value = newTime.toFixed(0)
  }
})

onMounted(() => {
  resizeCanvas()
  render()
})
</script>

<template>
  <div class="preview-section">
    <div class="section-title">
      <span>预览</span>
    </div>
    <div class="time-input-section">
      <div class="input-with-unit">
        <input 
          v-model="timeInput" 
          type="number" 
          :placeholder="useBpmMode ? '输入节拍' : '输入时间'" 
          class="time-input"
        />
        <span class="input-unit">{{ useBpmMode ? '拍' : '毫秒' }}</span>
      </div>
      <button @click="getCoordinates" class="get-coordinates-btn">
        获取时间节点
      </button>
      <div v-if="coordinates" class="coordinates-display">
        坐标: ({{ coordinates.x.toFixed(2) }}, {{ coordinates.y.toFixed(2) }})
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
  min-height: 0;
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

.input-with-unit {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  border-radius: 4px;
  overflow: hidden;
  background: $bg-secondary;
}

.time-input {
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: $text-primary;
  width: 100px;
  font-size: $font-size-md;
  
  /* 移除上下箭头 */
  -moz-appearance: textfield;
  appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.input-unit {
  padding: 6px 10px;
  background: $bg-tertiary;
  color: $text-secondary;
  font-size: $font-size-sm;
  border-left: 1px solid $border;
  white-space: nowrap;
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
    background: $accent-hover;
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