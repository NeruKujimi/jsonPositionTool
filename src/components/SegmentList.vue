<script setup lang="ts">
import type { Segment } from '@/types'
import SegmentEditor from './SegmentEditor.vue'

defineProps<{
  segments: Segment[]
}>()

const emit = defineEmits<{
  add: []
  remove: [id: number]
  update: [id: number, field: keyof Segment, value: number | string | boolean]
  'toggle-linked': [id: number, linked: boolean]
}>()
</script>

<template>
  <div class="segment-list">
    <div class="section-title">
      <span>Segments</span>
      <button @click="emit('add')">+ Add</button>
    </div>
    <div class="segments-container">
      <SegmentEditor
        v-for="(seg, index) in segments"
        :key="seg.id"
        :segment="seg"
        :index="index"
        :is-first="index === 0"
        @remove="emit('remove', $event)"
        @update="(id, field, value) => emit('update', id, field, value)"
        @toggle-linked="(id, linked) => emit('toggle-linked', id, linked)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.segment-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.section-title {
  @include flex-between;
  background: $bg-secondary;
  padding: $section-padding;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;

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

.segments-container {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
}
</style>