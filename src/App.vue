<script setup lang="ts">
import { ref, computed } from 'vue'
import SegmentList from '@/components/SegmentList.vue'
import JsonOutput from '@/components/JsonOutput.vue'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import { useSegments } from '@/composables/useSegments'
import { useAnimation } from '@/composables/useAnimation'
import { segmentsToJsonString } from '@/utils/positionJson'

const { segments, addSegment, removeSegment, updateField, toggleLinked, maxEndTime, parseJson } = useSegments()
const { currentTime, playing, togglePlay, reset, getPointAtTime } = useAnimation()

const timeUnit = ref<'milliseconds' | 'seconds'>('milliseconds')
const bpm = ref(120)
const useBpmMode = ref(false)

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
</script>

<template>
  <header class="app-header">
    <h1>JSON Position Tool</h1>
  </header>
  <main class="app-main">
    <div class="left-panel">
  <div class="bpm-control">
    <label class="bpm-toggle">
      <input type="checkbox" v-model="useBpmMode" />
      BPM Mode
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
    @add="handleAddSegment"
    @remove="(id: number) => removeSegment(id)"
    @update="updateField"
    @toggle-linked="toggleLinked"
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
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.app-header {
  h1 {
    text-align: center;
    padding: 12px;
    background: $bg-secondary;
    color: $accent;
    font-size: $font-size-xl;
    border-bottom: 2px solid $border;
  }
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 55%;
  display: flex;
  flex-direction: column;
  border-right: 2px solid $border;

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
  width: 45%;
  display: flex;
  flex-direction: column;
}
</style>