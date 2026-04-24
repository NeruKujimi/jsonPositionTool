<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Segment } from '@/types'
import { getAllEaseNames } from '@/registry/easing'
import EasePreview from './EasePreview.vue'
import CoordinatePicker from './CoordinatePicker.vue'

const props = defineProps<{
  segment: Segment
  index: number
  isFirst: boolean
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
const useBeats = ref(false)
const startBeat = ref(0)
const endBeat = ref(0)

const linkNote = computed(() =>
  props.segment.linked && !props.isFirst
    ? '* Linked to previous segment (start values auto-filled)'
    : ''
)

const msPerBeat = computed(() => 60000 / props.bpm)

function beatsToMs(beats: number): number {
  return beats * msPerBeat.value
}

function msToBeats(ms: number): number {
  return ms / msPerBeat.value
}

function round(value: number): number {
  return Math.round(value)
}

watch(() => props.useBpmMode, (newVal) => {
  useBeats.value = newVal
})

watch(useBeats, (newVal) => {
  if (newVal) {
    startBeat.value = msToBeats(props.segment.startTime)
    endBeat.value = msToBeats(props.segment.endTime)
  }
})

watch(startBeat, (newVal) => {
  if (useBeats.value) {
    emit('update', props.segment.id, 'startTime', beatsToMs(newVal))
  }
})

watch(endBeat, (newVal) => {
  if (useBeats.value) {
    emit('update', props.segment.id, 'endTime', beatsToMs(newVal))
  }
})

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

// function openEditCoordinatePicker() {
//   currentPickerMode.value = 'edit'
//   showCoordinatePicker.value = true
// }

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

function handleMirrorHorizontal() {
  if (props.vectorOps) {
    props.vectorOps.mirrorHorizontal([props.segment.id])
  }
}

function handleMirrorVertical() {
  if (props.vectorOps) {
    props.vectorOps.mirrorVertical([props.segment.id])
  }
}

function handleMirrorDiagonal() {
  if (props.vectorOps) {
    props.vectorOps.mirrorDiagonal([props.segment.id])
  }
}

const rotateAngle = ref(90)
const rotationCenter = ref<'start' | 'center' | 'end'>('center')

function handleRotate() {
  if (props.vectorOps) {
    props.vectorOps.rotate(rotateAngle.value, rotationCenter.value, [props.segment.id])
  }
}

const translateDx = ref(0)
const translateDy = ref(0)

function handleTranslate() {
  if (props.vectorOps) {
    props.vectorOps.translate(translateDx.value, translateDy.value, [props.segment.id])
  }
}

const scaleSx = ref(1)
const scaleSy = ref(1)

function handleScale() {
  if (props.vectorOps) {
    props.vectorOps.scale(scaleSx.value, scaleSy.value, [props.segment.id])
  }
}
</script>

<template>
  <div class="segment">
    <div class="seg-header">
      <span class="seg-index">事件 {{ index + 1 }}</span>
      <button class="btn-remove" @click="emit('remove', segment.id)">删除</button>
    </div>
    <div class="row" v-if="!useBpmMode">
      <label>开始时间</label>
      <div class="input-with-unit">
        <input type="number" :value="segment.startTime" @input="onFieldInput('startTime', $event)" />
        <span class="unit">ms</span>
      </div>
      <label>结束时间</label>
      <div class="input-with-unit">
        <input type="number" :value="segment.endTime" @input="onFieldInput('endTime', $event)" />
        <span class="unit">ms</span>
      </div>
    </div>
    <div class="row" v-else>
      <label>开始节拍</label>
      <input type="number" v-model.number="startBeat" step="0.25" />
      <label>结束节拍</label>
      <input type="number" v-model.number="endBeat" step="0.25" />
    </div>
    <div class="row time-preview" v-if="useBpmMode">
      <label>实际时间</label>
      <span class="time-preview-value">Start: {{ round(beatsToMs(startBeat)) }}ms</span>
      <span class="time-preview-value">End: {{ round(beatsToMs(endBeat)) }}ms</span>
    </div>
    <div class="row">
      <label>起点</label>
      <span class="coord-value">{{ segment.startX }}, {{ segment.startY }}</span>
      <button @click="openCoordinatePicker('start')" class="coord-btn">修改</button>
      <label>终点</label>
      <span class="coord-value">{{ segment.endX }}, {{ segment.endY }}</span>
      <button @click="openCoordinatePicker('end')" class="coord-btn">修改</button>
      <button @click="openDoubleCoordinatePicker" class="coord-btn">同时选点</button>
    </div>
    <div class="row">
      <label>缓动</label>
      <select :value="segment.easeType" @change="onFieldInput('easeType', $event)">
        <option v-for="name in easeOptions" :key="name" :value="name">{{ name }}</option>
      </select>
      <button @click="togglePreview" class="preview-btn">
        {{ showPreview ? '隐藏预览' : '显示预览' }}
      </button>
      <label class="link-label">
        <input type="checkbox" :checked="segment.linked" @change="onLinkToggle" />
        链接
      </label>
    </div>
    <div v-if="showPreview" class="ease-preview-container">
      <EasePreview :ease-name="segment.easeType" />
    </div>
    <div v-if="vectorOps" class="vector-ops-container">
      <div class="vector-ops-title">向量操作</div>
      <div class="vector-ops-row">
        <div class="vector-ops-item">
          <div class="vector-ops-label">镜像</div>
          <div class="vector-ops-buttons">
            <button @click="handleMirrorHorizontal" class="vector-btn">水平</button>
            <button @click="handleMirrorVertical" class="vector-btn">垂直</button>
            <button @click="handleMirrorDiagonal" class="vector-btn">对角</button>
          </div>
        </div>
      </div>
      <div class="vector-ops-row">
        <div class="vector-ops-item">
          <div class="vector-ops-label">旋转</div>
          <div class="vector-ops-inputs">
            <input type="number" v-model.number="rotateAngle" step="15" />
            <span>度</span>
            <select v-model="rotationCenter" class="rotation-center-select">
              <option value="start">绕起点</option>
              <option value="center">绕中心</option>
              <option value="end">绕终点</option>
            </select>
            <button @click="handleRotate" class="vector-btn">旋转</button>
          </div>
        </div>
      </div>
      <div class="vector-ops-row">
        <div class="vector-ops-item">
          <div class="vector-ops-label">平移</div>
          <div class="vector-ops-inputs">
            <label>X:</label>
            <input type="number" v-model.number="translateDx" step="0.5" />
            <label>Y:</label>
            <input type="number" v-model.number="translateDy" step="0.5" />
            <button @click="handleTranslate" class="vector-btn">平移</button>
          </div>
        </div>
      </div>
      <div class="vector-ops-row">
        <div class="vector-ops-item">
          <div class="vector-ops-label">缩放</div>
          <div class="vector-ops-inputs">
            <label>X:</label>
            <input type="number" v-model.number="scaleSx" step="0.1" />
            <label>Y:</label>
            <input type="number" v-model.number="scaleSy" step="0.1" />
            <button @click="handleScale" class="vector-btn">缩放</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="linkNote" class="seg-link">{{ linkNote }}</div>
    <CoordinatePicker 
      v-model="tempCoordinate" 
      :visible="showCoordinatePicker"
      :mode="currentPickerMode"
      :start-point="currentPickerMode === 'double' ? undefined : (currentPickerMode === 'edit' ? { x: segment.startX, y: segment.startY } : undefined)"
      :edit-target="currentPickerMode === 'edit' ? (currentPickerTarget || undefined) : undefined"
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

  .input-with-unit {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .unit {
      color: $text-secondary;
      font-size: $font-size-sm;
      white-space: nowrap;
    }
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

  .beat-toggle {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    margin-left: auto;
  }
}

.time-preview {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background: $bg-primary;
  border: 1px solid $border;
  border-radius: 4px;
  padding: $spacing-sm $spacing-md;
  margin-top: -$spacing-sm;
  margin-bottom: $spacing-md;

  .time-preview-label {
    white-space: nowrap;
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .time-preview-value {
    background: $bg-secondary;
    border: 1px solid $accent-border;
    border-radius: 4px;
    padding: $spacing-xs $spacing-sm;
    color: $accent;
    font-family: $font-mono;
    font-size: $font-size-sm;
    min-width: 100px;
    text-align: center;
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

.vector-ops-container {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-primary;
  border: 1px solid $border;
  border-radius: 4px;
}

.vector-ops-title {
  font-weight: bold;
  color: $accent;
  margin-bottom: $spacing-md;
  font-size: $font-size-base;
}

.vector-ops-row {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.vector-ops-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.vector-ops-label {
  color: $text-secondary;
  font-size: $font-size-sm;
  white-space: nowrap;
  min-width: 40px;
}

.vector-ops-buttons {
  display: flex;
  gap: $spacing-sm;
  flex: 1;
}

.vector-ops-inputs {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex: 1;
  flex-wrap: wrap;
  
  label {
    color: $text-secondary;
    font-size: $font-size-sm;
    white-space: nowrap;
  }
  
  input[type="number"] {
    @include input-base;
    width: $input-width-sm;
  }
  
  span {
    color: $text-secondary;
    font-size: $font-size-sm;
    white-space: nowrap;
  }
  
  .rotation-center-select {
    @include input-base;
    width: 120px;
  }
}

.vector-btn {
  @include button-base;
  font-size: $font-size-sm;
  padding: $spacing-xs $spacing-sm;
  white-space: nowrap;
}
</style>