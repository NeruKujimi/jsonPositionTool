<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  json: string
  timeUnit: 'milliseconds' | 'seconds'
}>()

const emit = defineEmits<{
  'update:timeUnit': [value: 'milliseconds' | 'seconds']
}>()

const copied = ref(false)

function copyToClipboard() {
  navigator.clipboard.writeText(props.json).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1200)
  })
}

function handleTimeUnitChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:timeUnit', target.value as 'milliseconds' | 'seconds')
}
</script>

<template>
  <div class="json-section">
    <div class="section-title">
      <div class="title-controls">
        <span>JSON Output</span>
        <div class="time-unit-selector">
          <label>Time Unit:</label>
          <select :value="timeUnit" @change="handleTimeUnitChange">
            <option value="milliseconds">Milliseconds</option>
            <option value="seconds">Seconds</option>
          </select>
        </div>
      </div>
      <button @click="copyToClipboard">{{ copied ? 'Copied!' : 'Copy' }}</button>
    </div>
    <textarea class="json-output" :value="json" readonly></textarea>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.json-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  @include flex-between;
  background: $bg-secondary;
  padding: $section-padding;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;

  .title-controls {
    display: flex;
    align-items: center;
    gap: $spacing-xl;
  }

  .time-unit-selector {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-base;

    label {
      white-space: nowrap;
      color: $text-secondary;
    }

    select {
      @include input-base;
      width: 120px;
    }
  }

  button {
    font-size: $font-size-base;
    padding: $spacing-sm $spacing-xl;
    cursor: pointer;
    background: $bg-tertiary;
    color: $accent;
    border: 1px solid $accent;
    border-radius: $border-radius;

    &:hover {
      background: $accent-hover;
    }
  }
}

.json-output {
  flex: 1;
  background: $bg-canvas;
  border: none;
  color: #58a6ff;
  font-family: $font-mono;
  font-size: $font-size-base;
  padding: $spacing-lg;
  resize: none;
  outline: none;
  line-height: 1.5;
}
</style>