<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Segment } from '@/types'
import { getAllEaseNames } from '@/registry/easing'
import EasePreview from './EasePreview.vue'
import CoordinatePicker from './CoordinatePicker.vue'

const props = defineProps<{
  segment: Segment
  index: number
  isFirst: boolean
}>()

const emit = defineEmits<{
  remove: [id: number]
  update: [id: number, field: keyof Segment, value: number | string | boolean]
  'toggle-linked': [id: number, linked: boolean]
}>()

const easeOptions = getAllEaseNames()
const showPreview = ref(false)
const showCoordinatePicker = ref(false)
const currentPickerTarget = ref<'start' | 'end' | null>(null)
const tempCoordinate = ref({ x: 0, y: 0 })

const linkNote = computed(() =>
  props.segment.linked && !props.isFirst
    ? '* Linked to previous segment (start values auto-filled)'
    : ''
)

function onFieldInput(field: keyof Segment, event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  if (field === 'easeType') {
    emit('update', props.segment.id, field, target.value)
  } else {
    emit('update', props.segment.id, field, parseFloat(target.value) || 0)
  }
}

function onLinkToggle(event: Event) {
  const target = event.target as HTMLInputElement
  emit('toggle-linked', props.segment.id, target.checked)
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function openCoordinatePicker(target: 'start' | 'end') {
  currentPickerTarget.value = target
  if (target === 'start') {
    tempCoordinate.value = { x: props.segment.startX, y: props.segment.startY }
  } else {
    tempCoordinate.value = { x: props.segment.endX, y: props.segment.endY }
  }
  showCoordinatePicker.value = true
}

function handleCoordinateUpdate(value: { x: number, y: number }) {
  if (!currentPickerTarget.value) return
  
  if (currentPickerTarget.value === 'start') {
    emit('update', props.segment.id, 'startX', value.x)
    emit('update', props.segment.id, 'startY', value.y)
  } else {
    emit('update', props.segment.id, 'endX', value.x)
    emit('update', props.segment.id, 'endY', value.y)
  }
}

function handlePickerClose() {
  showCoordinatePicker.value = false
  currentPickerTarget.value = null
}
</script>

<template>
  <div class="segment">
    <div class="seg-header">
      <span class="seg-index">Segment {{ index + 1 }}</span>
      <button class="btn-remove" @click="emit('remove', segment.id)">Remove</button>
    </div>
    <div class="row">
      <label>Start Time</label>
      <input type="number" :value="segment.startTime" @input="onFieldInput('startTime', $event)" />
      <label>End Time</label>
      <input type="number" :value="segment.endTime" @input="onFieldInput('endTime', $event)" />
    </div>
    <div class="row">
      <label>Start</label>
      <span class="coord-value">{{ segment.startX }}, {{ segment.startY }}</span>
      <button @click="openCoordinatePicker('start')" class="coord-btn">选点</button>
      <label>End</label>
      <span class="coord-value">{{ segment.endX }}, {{ segment.endY }}</span>
      <button @click="openCoordinatePicker('end')" class="coord-btn">选点</button>
    </div>
    <div class="row">
      <label>Ease</label>
      <select :value="segment.easeType" @change="onFieldInput('easeType', $event)">
        <option v-for="name in easeOptions" :key="name" :value="name">{{ name }}</option>
      </select>
      <button @click="togglePreview" class="preview-btn">
        {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
      </button>
      <label class="link-label">
        <input type="checkbox" :checked="segment.linked" @change="onLinkToggle" />
        Link
      </label>
    </div>
    <div v-if="showPreview" class="ease-preview-container">
      <EasePreview :ease-name="segment.easeType" />
    </div>
    <div v-if="linkNote" class="seg-link">{{ linkNote }}</div>
    <CoordinatePicker 
      v-model="tempCoordinate" 
      :visible="showCoordinatePicker"
      @update:visible="handlePickerClose"
      @update:modelValue="handleCoordinateUpdate"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.segment {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
  padding: $spacing-lg $spacing-xl;
  position: relative;

  &:hover {
    border-color: $accent-border;
  }
}

.seg-header {
  @include flex-between;
  margin-bottom: $spacing-md;

  .seg-index {
    color: $accent;
    font-size: $font-size-md;
    font-weight: bold;
  }
}

.btn-remove {
  font-size: $font-size-sm;
  padding: $spacing-xs $spacing-lg;
  cursor: pointer;
  background: $danger-bg;
  color: $danger;
  border: 1px solid $danger;
  border-radius: $border-radius;

  &:hover {
    background: $danger-hover;
  }
}

.row {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-sm;
  align-items: center;

  label {
    font-size: $font-size-sm;
    color: $text-secondary;
    min-width: 55px;
    text-align: right;
  }

  input, select {
    @include input-base;
  }

  input {
    width: $input-width-sm;
  }

  select {
    width: $input-width-md;
  }
}

.link-label {
  min-width: auto !important;
  display: flex;
  align-items: center;
  gap: 4px;

  input[type="checkbox"] {
    width: auto;
  }
}

.preview-btn {
  padding: 4px 10px;
  font-size: $font-size-sm;
  background: $bg-primary;
  color: $text-primary;
  border: 1px solid $border;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: $accent;
    color: white;
    border-color: $accent;
  }
}

.coord-btn {
  padding: 2px 8px;
  font-size: $font-size-xs;
  background: $bg-primary;
  color: $accent;
  border: 1px solid $accent;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: $accent;
    color: white;
  }
}

.coord-value {
  min-width: 120px;
  padding: 2px 6px;
  background: $bg-primary;
  border: 1px solid $border;
  border-radius: $border-radius;
  color: $text-primary;
  font-family: monospace;
  font-size: $font-size-sm;
  text-align: center;
}

.ease-preview-container {
  margin-top: $spacing-sm;
  margin-left: 60px;
}

.seg-link {
  font-size: $font-size-xs;
  color: #4a9;
  margin-top: $spacing-xs;
  font-style: italic;
}
</style>