<script setup lang="ts">
import { computed } from 'vue'
import type { Segment } from '@/types'
import { getAllEaseNames } from '@/registry/easing'

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
      <label>Start X</label>
      <input type="number" :value="segment.startX" :disabled="segment.linked && !isFirst" @input="onFieldInput('startX', $event)" />
      <label>Start Y</label>
      <input type="number" :value="segment.startY" :disabled="segment.linked && !isFirst" @input="onFieldInput('startY', $event)" />
    </div>
    <div class="row">
      <label>End X</label>
      <input type="number" :value="segment.endX" @input="onFieldInput('endX', $event)" />
      <label>End Y</label>
      <input type="number" :value="segment.endY" @input="onFieldInput('endY', $event)" />
    </div>
    <div class="row">
      <label>Ease</label>
      <select :value="segment.easeType" @change="onFieldInput('easeType', $event)">
        <option v-for="name in easeOptions" :key="name" :value="name">{{ name }}</option>
      </select>
      <label class="link-label">
        <input type="checkbox" :checked="segment.linked" @change="onLinkToggle" />
        Link
      </label>
    </div>
    <div v-if="linkNote" class="seg-link">{{ linkNote }}</div>
  </div>
</template>

<style lang="scss" scoped>
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

.seg-link {
  font-size: $font-size-xs;
  color: #4a9;
  margin-top: $spacing-xs;
  font-style: italic;
}
</style>