<script setup lang="ts">
const props = defineProps<{
  currentTime: number
  maxTime: number
  playing: boolean
}>()

const emit = defineEmits<{
  'toggle-play': []
  reset: []
  'time-change': [value: number]
}>()

function onSliderInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('time-change', parseFloat(target.value))
}
</script>

<template>
  <div class="controls">
    <button :class="{ active: playing }" @click="emit('toggle-play')">
      {{ playing ? 'Pause' : 'Play' }}
    </button>
    <button @click="emit('reset')">Reset</button>
    <label>Time:</label>
    <input
      type="range"
      :min="0"
      :max="maxTime || 1"
      :value="currentTime"
      @input="onSliderInput"
    />
    <span class="time-display">{{ currentTime.toFixed(0) }} / {{ maxTime }}</span>
  </div>
</template>

<style lang="scss" scoped>
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