<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentTime: number
  maxTime: number
  playing: boolean
  useBpmMode: boolean
  bpm: number
}>()

const emit = defineEmits<{
  'toggle-play': []
  reset: []
  'time-change': [value: number]
}>()

// 计算当前时间（根据BPM模式）
const displayCurrentTime = computed(() => {
  if (props.useBpmMode) {
    const msPerBeat = 60000 / props.bpm
    return (props.currentTime / msPerBeat).toFixed(2)
  }
  return props.currentTime.toFixed(0)
})

// 计算最大时间（根据BPM模式）
const displayMaxTime = computed(() => {
  if (props.useBpmMode) {
    const msPerBeat = 60000 / props.bpm
    return (props.maxTime / msPerBeat).toFixed(2)
  }
  return props.maxTime
})

// 计算时间单位
const timeUnit = computed(() => props.useBpmMode ? '拍' : 'ms')

function onSliderInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('time-change', parseFloat(target.value))
}
</script>

<template>
  <div class="controls">
    <button :class="{ active: props.playing }" @click="emit('toggle-play')">
      {{ props.playing ? '暂停' : '播放' }}
    </button>
    <button @click="emit('reset')">停止</button>
    <label>时间:</label>
    <input
      type="range"
      :min="0"
      :max="props.maxTime || 1"
      :value="props.currentTime"
      @input="onSliderInput"
    />
    <span class="time-display">{{ displayCurrentTime }} {{ timeUnit }} / {{ displayMaxTime }} {{ timeUnit }}</span>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.controls {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-md $spacing-xl;
  background: $bg-secondary;
  flex-wrap: wrap;

  button {
    @include button-base;
  }

  label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  input[type="range"] {
    width: 100px;
  }
}

.time-display {
  font-size: $font-size-base;
  color: $accent;
  font-family: $font-mono;
}
</style>