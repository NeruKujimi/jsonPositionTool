<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  json: string
  timeUnit: 'milliseconds' | 'seconds'
}>()

const emit = defineEmits<{
  'update:timeUnit': [value: 'milliseconds' | 'seconds']
  'parse-json': [value: any]
}>()

const copied = ref(false)
const jsonText = ref(props.json)
const hasChanges = ref(false)
const saveFailed = ref(false)

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

function handleJsonInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  jsonText.value = target.value
  hasChanges.value = true
  saveFailed.value = false
}

function handleSave() {
  try {
    const parsed = JSON.parse(jsonText.value)
    emit('parse-json', parsed)
    hasChanges.value = false
    saveFailed.value = false
  } catch (e) {
    console.error('JSON parsing error:', e)
    saveFailed.value = true
  }
}

// Watch for external changes to json prop
watch(() => props.json, (newVal) => {
  jsonText.value = newVal
  hasChanges.value = false
  saveFailed.value = false
})

// Initialize
jsonText.value = props.json
</script>

<template>
  <div class="json-section-container">
    <div class="json-section">
      <div class="section-title">
        <div class="title-controls">
          <span>JSON 文本编辑</span>
          <div class="time-unit-selector">
            <label>时间单位:</label>
            <select :value="timeUnit" @change="handleTimeUnitChange">
              <option value="milliseconds">毫秒</option>
              <option value="seconds">秒</option>
            </select>
          </div>
        </div>
        <div class="section-buttons">
          <button @click="handleSave" v-if="hasChanges" :class="['save-btn', { 'save-failed': saveFailed }]">{{ saveFailed ? '修改失败' : '保存修改' }}</button>
          <button @click="copyToClipboard">{{ copied ? '已复制!' : '复制文本' }}</button>
        </div>
      </div>
      <textarea class="json-output" v-model="jsonText" @input="handleJsonInput"></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.json-section-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 50vh;
}

.json-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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

  .section-buttons {
    display: flex;
    align-items: center;
    gap: $spacing-md;
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

  .save-btn {
    background: $success-bg;
    border-color: $success;
    color: $success;

    &:hover {
      background: $success-bg;
      opacity: 0.8;
    }
    
    &.save-failed {
      background: $danger-bg;
      border-color: $danger;
      color: $danger;
      
      &:hover {
        background: $danger-bg;
        opacity: 0.8;
      }
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
  overflow-y: auto;
}
</style>