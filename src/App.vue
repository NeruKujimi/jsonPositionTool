<script setup lang="ts">
import { ref, computed } from 'vue'
import SegmentList from '@/components/SegmentList.vue'
import JsonOutput from '@/components/JsonOutput.vue'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import VectorModal from '@/components/VectorModal.vue'
import { useSegments } from '@/composables/useSegments'
import { useAnimation } from '@/composables/useAnimation'
import { segmentsToJsonString } from '@/utils/positionJson'

const { segments, addSegment, removeSegment, updateField, toggleLinked, maxEndTime, parseJson, mirrorHorizontal, mirrorVertical, mirrorDiagonal, rotate, translate, scale } = useSegments()
const { currentTime, playing, togglePlay, reset, getPointAtTime } = useAnimation()

const timeUnit = ref<'milliseconds' | 'seconds'>('seconds')
const isFullscreen = ref(false)
const bpm = ref(120)
const useBpmMode = ref(false)
const showVectorModal = ref(false)

const jsonOutput = computed(() => segmentsToJsonString(segments.value, timeUnit.value))

function handleAddSegment() {
  addSegment()
}

function handleTogglePlay() {
  togglePlay(segments.value, maxEndTime.value)
}

function handleReset() {
  reset()
}

function handleTimeChange(val: number) {
  currentTime.value = val
}

function handleParseJson(json: any) {
  if (Array.isArray(json)) {
    parseJson(json, timeUnit.value)
  }
}

function handleExit() {
  if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.app) {
    (window as any).electron.app.quit()
  } else {
    window.location.reload()
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch((err) => {
      console.error('Fullscreen error:', err)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false
      }).catch((err) => {
        console.error('Exit fullscreen error:', err)
      })
    }
  }
}

function handleOpenVectorModal() {
  showVectorModal.value = true
}

function handleVectorExecute(operation: string, params: any) {
  switch (operation) {
    case 'mirrorHorizontal':
      mirrorHorizontal()
      break
    case 'mirrorVertical':
      mirrorVertical()
      break
    case 'mirrorDiagonal':
      mirrorDiagonal()
      break
    case 'rotate':
      rotate(params.angle, params.rotationCenter)
      break
    case 'translate':
      translate(params.dx, params.dy)
      break
    case 'scale':
      scale(params.sx, params.sy)
      break
  }
}
</script>

<template>
  <header class="app-header">
    <h1>JSON Position Tool</h1>
    <div class="header-buttons">
      <button class="fullscreen-button" @click="toggleFullscreen">{{ isFullscreen ? '退出全屏' : '全屏' }}</button>
      <button class="exit-button" @click="handleExit">退出</button>
    </div>
  </header>
  <main class="app-main">
    <div class="left-panel">
  <div class="bpm-control">
    <label class="bpm-toggle">
      <input type="checkbox" v-model="useBpmMode" />
      BPM模式
    </label>
    <template v-if="useBpmMode">
      <label>BPM: </label>
      <input type="number" v-model.number="bpm" min="1" max="300" />
    </template>
  </div>
  <SegmentList
    :segments="segments"
    :bpm="bpm"
    :use-bpm-mode="useBpmMode"
    :vector-ops="{ mirrorHorizontal, mirrorVertical, mirrorDiagonal, rotate, translate, scale }"
    @add="handleAddSegment"
    @remove="(id: number) => removeSegment(id)"
    @update="updateField"
    @toggle-linked="toggleLinked"
    @open-vector-modal="handleOpenVectorModal"
  />
</div>
    <div class="right-panel">
      <JsonOutput :json="jsonOutput" v-model:timeUnit="timeUnit" @parse-json="handleParseJson" />
      <PlayerControls
        :current-time="currentTime"
        :max-time="maxEndTime"
        :playing="playing"
        @toggle-play="handleTogglePlay"
        @reset="handleReset"
        @time-change="handleTimeChange"
      />
      <PreviewCanvas
        :segments="segments"
        :current-time="currentTime"
        :max-time="maxEndTime"
        :get-point-at-time="getPointAtTime"
      />
    </div>
  </main>
  <VectorModal
    v-model:visible="showVectorModal"
    @execute="handleVectorExecute"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: $bg-secondary;
  border-bottom: 2px solid $border;

  h1 {
    color: $accent;
    font-size: $font-size-lg;
    margin: 0;
  }

  .header-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .exit-button {
    background: $danger;
    color: white;
    border: 1px solid $danger;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;

    &:hover {
      background: $danger-hover;
    }
  }

  .fullscreen-button {
    background: transparent;
    color: $danger;
    border: 1px solid $danger;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;

    &:hover {
      background: $danger;
      color: white;
    }
  }
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
  border-right: 2px solid $border;
  overflow: hidden;

  .bpm-control {
    padding: 16px;
    background: $bg-secondary;
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    gap: 12px;

    label {
      color: $text-secondary;
      font-weight: bold;
    }

    .bpm-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: $text-secondary;
      font-weight: bold;
    }

    input[type="number"] {
      @include input-base;
      width: 80px;
    }
  }
}

.right-panel {
  width: 55%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>