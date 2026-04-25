<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import SegmentList from '@/components/SegmentList.vue'
import JsonOutput from '@/components/JsonOutput.vue'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import VectorModal from '@/components/VectorModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useSegments } from '@/composables/useSegments'
import { useAnimation } from '@/composables/useAnimation'
import { segmentsToJsonString } from '@/utils/positionJson'
import { saveState, loadState, clearState, hasSavedState } from '@/utils/storage'

const { segments, groups, activeGroupId, visibleSegments, addSegment, removeSegment, updateField, toggleLinked, maxEndTime, parseJson, mirrorHorizontal, mirrorVertical, mirrorDiagonal, rotate, translate, scale, createGroup, deleteGroup, updateGroup, addSegmentsToGroup, removeSegmentsFromGroup, toggleGroupExpand, setActiveGroup, loadSegmentsFromData, resetAll } = useSegments()
const { currentTime, playing, togglePlay, reset, getPointAtTime } = useAnimation()

const timeUnit = ref<'milliseconds' | 'seconds'>('seconds')
const isFullscreen = ref(false)
const bpm = ref(120)
const useBpmMode = ref(false)
const showVectorModal = ref(false)
const showExitModal = ref(false)

const hasSavedStateCheck = computed(() => hasSavedState())

onMounted(() => {
  const savedState = loadState()
  if (savedState) {
    loadSegmentsFromData(savedState.segments, savedState.groups)
    bpm.value = savedState.bpm
    useBpmMode.value = savedState.useBpmMode
  }
})

const jsonOutput = computed(() => {
  // 当切换BPM模式或BPM值变化时，强制重新计算JSON输出
  useBpmMode.value // 确保依赖于useBpmMode
  bpm.value // 确保依赖于bpm
  return segmentsToJsonString(segments.value, timeUnit.value)
})

// 监听BPM变化，保持拍数不变但更新实际时间
let currentBeat = 0
watch(bpm, (newBpm, oldBpm) => {
  if (useBpmMode.value && oldBpm && newBpm) {
    // 计算当前拍数
    const oldMsPerBeat = 60000 / oldBpm
    currentBeat = currentTime.value / oldMsPerBeat
    
    // 使用新的BPM值计算新的毫秒时间
    const newMsPerBeat = 60000 / newBpm
    currentTime.value = currentBeat * newMsPerBeat
  }
})

// 监听useBpmMode变化，保持时间一致性
watch(useBpmMode, (newMode) => {
  if (newMode) {
    // 切换到BPM模式，记录当前拍数
    const msPerBeat = 60000 / bpm.value
    currentBeat = currentTime.value / msPerBeat
  } else {
    // 切换到非BPM模式，保持毫秒时间不变
  }
})

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
  showExitModal.value = true
}

function handleExitConfirm() {
  saveState(segments.value, groups.value, bpm.value, useBpmMode.value)
  if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.app) {
    (window as any).electron.app.quit()
  } else {
    window.location.reload()
  }
}

function handleExitCancel() {
  if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.app) {
    (window as any).electron.app.quit()
  } else {
    window.location.reload()
  }
}

function handleExitNeutral() {
  showExitModal.value = false
}

function handleClearAndReload() {
  clearState()
  resetAll()
  window.location.reload()
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

function handleCreateGroup(name: string, segmentIds: number[]) {
  createGroup(name, segmentIds)
}

function handleDeleteGroup(groupId: number) {
  deleteGroup(groupId)
}

function handleUpdateGroup(groupId: number, updates: any) {
  updateGroup(groupId, updates)
}

function handleAddSegmentsToGroup(groupId: number, segmentIds: number[]) {
  addSegmentsToGroup(groupId, segmentIds)
}

function handleRemoveSegmentsFromGroup(groupId: number, segmentIds: number[]) {
  removeSegmentsFromGroup(groupId, segmentIds)
}

function handleToggleGroupExpand(groupId: number) {
  toggleGroupExpand(groupId)
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
    <h1>《汐梦之歌》Position工具</h1>
    <div class="header-buttons">
      <button v-if="hasSavedStateCheck" @click="handleClearAndReload" class="clear-button">清空已保存</button>
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
    :groups="groups"
    :bpm="bpm"
    :use-bpm-mode="useBpmMode"
    :vector-ops="{ mirrorHorizontal, mirrorVertical, mirrorDiagonal, rotate, translate, scale }"
    @add="handleAddSegment"
    @remove="(id: number) => removeSegment(id)"
    @update="updateField"
    @toggle-linked="toggleLinked"
    @open-vector-modal="handleOpenVectorModal"
    @create-group="handleCreateGroup"
    @delete-group="handleDeleteGroup"
    @update-group="handleUpdateGroup"
    @add-segments-to-group="handleAddSegmentsToGroup"
    @remove-segments-from-group="handleRemoveSegmentsFromGroup"
    @toggle-group-expand="handleToggleGroupExpand"
  />
  <div class="group-preview-control" v-if="groups.length > 0">
    <label>预览分组: </label>
    <select v-model="activeGroupId" @change="setActiveGroup(activeGroupId)">
      <option :value="null">全部</option>
      <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
    </select>
  </div>
</div>
    <div class="right-panel">
      <JsonOutput :json="jsonOutput" v-model:timeUnit="timeUnit" @parse-json="handleParseJson" />
      <PlayerControls
        :current-time="currentTime"
        :max-time="maxEndTime"
        :playing="playing"
        :use-bpm-mode="useBpmMode"
        :bpm="bpm"
        @toggle-play="handleTogglePlay"
        @reset="handleReset"
        @time-change="handleTimeChange"
      />
      <PreviewCanvas
        :segments="visibleSegments"
        :current-time="currentTime"
        :max-time="maxEndTime"
        :get-point-at-time="getPointAtTime"
        :use-bpm-mode="useBpmMode"
        :bpm="bpm"
        @time-change="handleTimeChange"
      />
    </div>
  </main>
  <VectorModal
    v-model:visible="showVectorModal"
    @execute="handleVectorExecute"
  />
  <ConfirmModal
    v-model:visible="showExitModal"
    title="保存配置"
    message="是否保存当前配置？\n\n是 - 保存配置，下次启动时自动加载\n否 - 不保存，下次启动时为空\n取消 - 取消关闭"
    confirm-text="是"
    cancel-text="否"
    neutral-text="取消"
    @confirm="handleExitConfirm"
    @cancel="handleExitCancel"
    @neutral="handleExitNeutral"
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

  .clear-button {
    background: $accent;
    color: white;
    border: 1px solid $accent;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;

    &:hover {
      background: $accent-hover;
    }
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

  .group-preview-control {
    padding: 12px 16px;
    background: $bg-secondary;
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    gap: 12px;

    label {
      color: $text-secondary;
      font-weight: bold;
      font-size: $font-size-sm;
    }

    select {
      @include input-base;
      min-width: 150px;
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