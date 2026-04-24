<script setup lang="ts">
import type { Segment } from '@/types'
import SegmentEditor from './SegmentEditor.vue'

defineProps<{
  segments: Segment[]
  bpm: number
  useBpmMode: boolean
  vectorOps?: {
    mirrorHorizontal: (ids?: number[]) => void
    mirrorVertical: (ids?: number[]) => void
    mirrorDiagonal: (ids?: number[]) => void
    rotate: (angle: number, rotationCenter: 'start' | 'center' | 'end', ids?: number[]) => void
    translate: (dx: number, dy: number, ids?: number[]) => void
    scale: (sx: number, sy: number, ids?: number[]) => void
  }
}>()

const emit = defineEmits<{
  add: []
  remove: [id: number]
  update: [id: number, field: keyof Segment, value: number | string | boolean]
  'toggle-linked': [id: number, linked: boolean]
  'open-vector-modal': []
}>()
</script>

<template>
  <div class="segment-list">
    <div class="section-title">
      <span>事件</span>
      <div class="section-buttons">
        <button @click="emit('add')">+ 添加</button>
        <button @click="emit('open-vector-modal')" class="vector-modal-btn">统一事件操作</button>
      </div>
    </div>
    <div class="segments-container">
      <SegmentEditor
        v-for="(seg, index) in segments"
        :key="seg.id"
        :segment="seg"
        :index="index"
        :is-first="index === 0"
        :bpm="bpm"
        :use-bpm-mode="useBpmMode"
        :vector-ops="vectorOps"
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
  min-height: 0;
}

.section-title {
  @include flex-between;
  background: $bg-secondary;
  padding: $section-padding;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;

  .section-buttons {
    display: flex;
    gap: $spacing-md;
    align-items: center;
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

  .vector-modal-btn {
    background: $bg-tertiary;
    color: $accent;
    border: 1px solid $accent;
  }
}

.segments-container {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  min-height: 0;
}
</style>