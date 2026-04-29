<script setup lang="ts">
/**
 * ========================================
 * App.vue - 应用主组件
 * ========================================
 * 
 * 【组件说明】
 * 应用的主入口组件，负责整合所有子组件和功能模块
 * 
 * 【模块划分】
 * - AppHeader: 头部区域（标题、操作按钮）
 * - BpmControl: BPM控制
 * - SegmentList: 事件列表管理
 * - GroupPreviewSelector: 分组预览选择
 * - JsonOutput: JSON输入输出
 * - PlayerControls: 播放控制
 * - PreviewCanvas: 预览画布
 * - VectorModal: 批量向量操作弹窗
 * - ConfirmModal: 确认对话框
 * 
 * 【状态管理】
 * 使用组合式函数分散管理状态：
 * - useSegments: 事件和分组数据
 * - useAnimation: 播放时间线
 * - useApp: 应用级状态（BPM、全屏等）
 * - usePreviewGroups: 分组预览选择
 * - useExitHandler: 退出处理
 * 
 * 【数据流】
 * 1. 启动时从 localStorage 加载保存的配置
 * 2. 用户操作通过事件传递给对应的组合式函数
 * 3. 状态变化通过组合式函数同步到各个组件
 * 4. 退出时可选择保存当前配置到 localStorage
 */

import { ref, computed, onMounted } from 'vue'

// 导入子组件
import AppHeader from '@/components/AppHeader.vue'
import BpmControl from '@/components/BpmControl.vue'
import SegmentList from '@/components/SegmentList.vue'
import GroupPreviewSelector from '@/components/GroupPreviewSelector.vue'
import JsonOutput from '@/components/JsonOutput.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import VectorModal from '@/components/VectorModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

// 导入组合式函数
import { useSegments } from '@/composables/useSegments'
import { useAnimation } from '@/composables/useAnimation'
import { useApp } from '@/composables/useApp'
import { usePreviewGroups } from '@/composables/usePreviewGroups'
import { useExitHandler } from '@/composables/useExitHandler'

// 导入工具函数
import { segmentsToJsonString } from '@/utils/positionJson'
import { saveState, loadState, clearState, hasSavedState } from '@/utils/storage'

// =============================================
// 组合式函数初始化
// =============================================

// 事件和分组数据管理
const {
  segments,
  groups,
  visibleSegments,
  addSegment,
  removeSegment,
  updateField,
  toggleLinked,
  maxEndTime,
  parseJson,
  mirrorHorizontal,
  mirrorVertical,
  mirrorDiagonal,
  rotate,
  translate,
  scale,
  createGroup,
  deleteGroup,
  updateGroup,
  addSegmentsToGroup,
  removeSegmentsFromGroup,
  toggleGroupExpand,
  loadSegmentsFromData,
  resetAll,
  setSelectedGroups,
  removeAllGroups,
} = useSegments()

// 播放动画控制
const { currentTime, playing, togglePlay, reset, getPointAtTime } = useAnimation()

// 应用级状态
const { bpm, useBpmMode, beatPrecision, timeUnit, toggleFullscreen } = useApp()

// 分组预览选择
const { selectedGroupIds, isGroupSelected, toggleGroupSelection, clearSelection } = usePreviewGroups()

// 退出处理
const { showExitModal, handleExit, handleExitConfirm, handleExitCancel, handleExitNeutral, handleClearAndReload } = useExitHandler({
  onSave: () => saveState(segments.value, groups.value, bpm.value, useBpmMode.value),
  onQuit: () => {
    if (typeof window !== 'undefined' && (window as any).electron && (window as any).electron.app) {
      (window as any).electron.app.quit()
    } else {
      window.location.reload()
    }
  },
  onReset: () => {
    clearState()
    resetAll()
  },
})

// =============================================
// 本地状态
// =============================================

/** 是否存在已保存的状态 */
const hasSavedStateCheck = computed(() => hasSavedState())

/** 向量操作弹窗显示状态 */
const showVectorModal = ref(false)

// =============================================
// 计算属性
// =============================================

/**
 * JSON输出
 * @description 根据当前事件和时间单位生成JSON字符串
 */
const jsonOutput = computed(() => {
  // 依赖 useBpmMode 和 bpm 确保变化时重新计算
  useBpmMode.value
  bpm.value
  return segmentsToJsonString(segments.value, timeUnit.value)
})

// =============================================
// 生命周期钩子
// =============================================

/**
 * 组件挂载时加载保存的状态
 */
onMounted(() => {
  const savedState = loadState()
  if (savedState) {
    // 加载事件和分组数据
    loadSegmentsFromData(savedState.segments, savedState.groups)
    // 恢复BPM设置
    bpm.value = savedState.bpm
    useBpmMode.value = savedState.useBpmMode
  }
})

// =============================================
// 事件处理函数
// =============================================

/** 添加新事件 */
function handleAddSegment() {
  addSegment()
}

/** 切换播放状态 */
function handleTogglePlay() {
  togglePlay(segments.value, maxEndTime.value)
}

/** 重置播放 */
function handleReset() {
  reset()
}

/** 更新时间 */
function handleTimeChange(val: number) {
  currentTime.value = val
}

/** 解析JSON */
function handleParseJson(json: any) {
  if (Array.isArray(json)) {
    parseJson(json, timeUnit.value)
  }
}

/** 打开向量操作弹窗 */
function handleOpenVectorModal() {
  showVectorModal.value = true
}

/** 创建分组 */
function handleCreateGroup(name: string, segmentIds: number[]) {
  createGroup(name, segmentIds)
}

/** 删除分组 */
function handleDeleteGroup(groupId: number) {
  deleteGroup(groupId)
}

/** 更新分组 */
function handleUpdateGroup(groupId: number, updates: any) {
  updateGroup(groupId, updates)
}

/** 添加事件到分组 */
function handleAddSegmentsToGroup(groupId: number, segmentIds: number[]) {
  addSegmentsToGroup(groupId, segmentIds)
}

/** 从分组移除事件 */
function handleRemoveSegmentsFromGroup(groupId: number, segmentIds: number[]) {
  removeSegmentsFromGroup(groupId, segmentIds)
}

/** 切换分组展开/折叠 */
function handleToggleGroupExpand(groupId: number) {
  toggleGroupExpand(groupId)
}

/** 移除所有分组 */
function handleRemoveAllGroups() {
  removeAllGroups()
  clearSelection()
  setSelectedGroups([])
}

/** 执行向量操作 */
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

/** 切换分组预览选择 */
function handleToggleGroupPreview(groupId: number) {
  toggleGroupSelection(groupId)
  setSelectedGroups(selectedGroupIds.value)
}

/** 清空分组预览选择 */
function handleClearGroupPreview() {
  clearSelection()
  setSelectedGroups([])
}
</script>

<template>
  <!-- 应用头部 -->
  <AppHeader
    :has-saved-state="hasSavedStateCheck"
    :is-fullscreen="false"
    @clear="handleClearAndReload"
    @fullscreen="toggleFullscreen"
    @exit="handleExit"
  />

  <!-- 主内容区域 -->
  <main class="app-main">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <!-- BPM控制 -->
      <BpmControl
        v-model:use-bpm-mode="useBpmMode"
        v-model:bpm="bpm"
        v-model:beat-precision="beatPrecision"
      />

      <!-- 事件列表 -->
      <SegmentList
        :segments="segments"
        :groups="groups"
        :bpm="bpm"
        :use-bpm-mode="useBpmMode"
        :beat-precision="beatPrecision"
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
        @remove-all-groups="handleRemoveAllGroups"
      />

      <!-- 分组预览选择 -->
      <GroupPreviewSelector
        :groups="groups"
        :selected-group-ids="selectedGroupIds"
        :is-group-selected="isGroupSelected"
        @toggle="handleToggleGroupPreview"
        @clear="handleClearGroupPreview"
      />
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <!-- JSON输入输出 -->
      <JsonOutput 
        :json="jsonOutput" 
        v-model:timeUnit="timeUnit" 
        @parse-json="handleParseJson" 
      />

      <!-- 播放控制 -->
      <PlayerControls
        :current-time="currentTime"
        :max-time="maxEndTime"
        :playing="playing"
        :use-bpm-mode="useBpmMode"
        :bpm="bpm"
        :beat-precision="beatPrecision"
        @toggle-play="handleTogglePlay"
        @reset="handleReset"
        @time-change="handleTimeChange"
      />

      <!-- 预览画布 -->
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

  <!-- 向量操作弹窗 -->
  <VectorModal
    v-model:visible="showVectorModal"
    @execute="handleVectorExecute"
  />

  <!-- 退出确认弹窗 -->
  <ConfirmModal
    v-model:visible="showExitModal"
    title="保存配置"
    message="是否保存当前配置？

是 - 保存配置，下次启动时自动加载
否 - 不保存，下次启动时为空
取消 - 取消关闭"
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

// 主内容区域
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// 左侧面板
.left-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
  border-right: 2px solid $border;
  overflow: hidden;
}

// 右侧面板
.right-panel {
  width: 55%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
