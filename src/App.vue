<script setup lang="ts">
import { ref, computed } from 'vue'
import SegmentList from '@/components/SegmentList.vue'
import JsonOutput from '@/components/JsonOutput.vue'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import { useSegments } from '@/composables/useSegments'
import { useAnimation } from '@/composables/useAnimation'
import { segmentsToJsonString } from '@/utils/positionJson'

const { segments, addSegment, removeSegment, updateField, toggleLinked, maxEndTime } = useSegments()
const { currentTime, playing, togglePlay, reset, getPointAtTime } = useAnimation()

const timeUnit = ref<'milliseconds' | 'seconds'>('milliseconds')

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
</script>

<template>
  <header class="app-header">
    <h1>JSON Position Tool</h1>
  </header>
  <main class="app-main">
    <div class="left-panel">
      <SegmentList
        :segments="segments"
        @add="handleAddSegment"
        @remove="(id: number) => removeSegment(id)"
        @update="updateField"
        @toggle-linked="toggleLinked"
      />
    </div>
    <div class="right-panel">
      <JsonOutput :json="jsonOutput" v-model:timeUnit="timeUnit" />
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
}

.right-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
}
</style>