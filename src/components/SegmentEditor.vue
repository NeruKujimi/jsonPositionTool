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
const currentPickerMode = ref<'single' | 'double' | 'edit'>('single')
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
  currentPickerMode.value = 'edit'
  currentPickerTarget.value = target
  if (target === 'start') {
    tempCoordinate.value = { x: props.segment.startX, y: props.segment.startY }
  } else {
    tempCoordinate.value = { x: props.segment.endX, y: props.segment.endY }
  }
  showCoordinatePicker.value = true
}

function openDoubleCoordinatePicker() {
  currentPickerMode.value = 'double'
  currentPickerTarget.value = null
  tempCoordinate.value = { x: props.segment.startX, y: props.segment.startY }
  showCoordinatePicker.value = true
}

function openEditCoordinatePicker() {
  currentPickerMode.value = 'edit'
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

function handleSelectStart(value: { x: number, y: number }) {
  emit('update', props.segment.id, 'startX', value.x)
  emit('update', props.segment.id, 'startY', value.y)
}

function handleSelectEnd(value: { x: number, y: number }) {
  emit('update', props.segment.id, 'endX', value.x)
  emit('update', props.segment.id, 'endY', value.y)
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
      <button @click="openCoordinatePicker('start')" class="coord-btn">修改</button>
      <label>End</label>
      <span class="coord-value">{{ segment.endX }}, {{ segment.endY }}</span>
      <button @click="openCoordinatePicker('end')" class="coord-btn">修改</button>
      <button @click="openDoubleCoordinatePicker" class="coord-btn">同时选点</button>
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
      :mode="currentPickerMode"
      :start-point="currentPickerMode === 'double' ? undefined : (currentPickerMode === 'edit' ? { x: segment.startX, y: segment.startY } : undefined)"
      :edit-target="currentPickerMode === 'edit' ? currentPickerTarget : undefined"
      :other-point="currentPickerMode === 'edit' ? (currentPickerTarget === 'start' ? { x: segment.endX, y: segment.endY } : { x: segment.startX, y: segment.startY }) : undefined"
      @update:visible="handlePickerClose"
      @update:modelValue="handleCoordinateUpdate"
      @select-start="handleSelectStart"
      @select-end="handleSelectEnd"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.segment {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: 8px;
  padding: $section-padding;
  margin-bottom: $spacing-lg;
}

.seg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border;

  .seg-index {
    font-weight: bold;
    color: $accent;
  }

  .btn-remove {
    @include button-base;
    background: $danger-bg;
    border-color: $danger;
    color: $danger;

    &:hover {
      background: $danger-hover;
    }
  }
}

.row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;

  label {
    white-space: nowrap;
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  input[type="number"] {
    @include input-base;
    width: $input-width-sm;
  }

  select {
    @include input-base;
    width: $input-width-md;
  }

  .coord-value {
    background: $bg-primary;
    border: 1px solid $border;
    border-radius: 4px;
    padding: $spacing-sm $spacing-md;
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: $accent;
    min-width: 120px;
    text-align: center;
  }

  .coord-btn {
    @include button-base;
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-sm;
  }

  .preview-btn {
    @include button-base;
    font-size: $font-size-sm;
  }

  .link-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.ease-preview-container {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-primary;
  border: 1px solid $border;
  border-radius: 4px;
}

.seg-link {
  margin-top: $spacing-md;
  padding: $spacing-sm;
  background: rgba($accent, 0.1);
  border: 1px solid rgba($accent, 0.3);
  border-radius: 4px;
  color: $accent;
  font-size: $font-size-xs;
  font-style: italic;
}
</style>