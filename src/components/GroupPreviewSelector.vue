<script setup lang="ts">
/**
 * ========================================
 * GroupPreviewSelector.vue - 分组预览选择组件
 * ========================================
 * 
 * 【组件说明】
 * 允许用户选择要预览的分组，支持连续分组选择
 * 
 * 【功能特性】
 * - 复选框形式选择分组
 * - 连续选择规则：选中分组1和3时，自动包含分组2
 * - 取消选择规则：只能从边界分组开始取消
 * - 清除选择按钮
 * 
 * 【使用方式】
 * ```vue
 * <GroupPreviewSelector
 *   :groups="groups"
 *   :selected-group-ids="selectedGroupIds"
 *   :is-group-selected="isGroupSelected"
 *   @toggle="handleToggle"
 *   @clear="handleClear"
 * />
 * ```
 */

import type { SegmentGroup } from '@/types'

/**
 * 定义组件接收的props
 */
defineProps<{
  /** 所有分组列表 */
  groups: SegmentGroup[]
  /** 当前选中的分组ID列表 */
  selectedGroupIds: number[]
  /** 检查分组是否选中的函数 */
  isGroupSelected: (groupId: number) => boolean
}>()

/**
 * 定义组件发出的事件
 */
const emit = defineEmits<{
  /** 切换分组选择状态 */
  'toggle': [groupId: number]
  /** 清除所有选择 */
  'clear': []
}>()

/**
 * 处理分组选择切换
 * @param groupId - 要切换的分组ID
 */
function handleToggle(groupId: number) {
  emit('toggle', groupId)
}

/**
 * 处理清除选择
 */
function handleClear() {
  emit('clear')
}
</script>

<template>
  <!-- 分组预览选择区域 -->
  <div class="group-preview-control" v-if="groups.length > 0">
    <!-- 标题标签 -->
    <span class="preview-label">预览分组: </span>
    
    <!-- 分组复选框列表 -->
    <div class="group-checkboxes">
      <label
        v-for="group in groups"
        :key="group.id"
        class="group-checkbox-item"
        :class="{ selected: isGroupSelected(group.id) }"
      >
        <!-- 复选框 -->
        <input
          type="checkbox"
          :checked="isGroupSelected(group.id)"
          @change="handleToggle(group.id)"
        />
        <!-- 分组名称 -->
        {{ group.name }}
      </label>
    </div>
    
    <!-- 清除选择按钮（仅在有选中时显示） -->
    <button 
      v-if="selectedGroupIds.length > 0" 
      @click="handleClear" 
      class="clear-preview-btn"
    >
      清除选择
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// 分组预览控制区域容器
.group-preview-control {
  padding: 12px 16px;
  background: $bg-secondary;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  // 预览标签样式
  .preview-label {
    color: $text-secondary;
    font-weight: bold;
    font-size: $font-size-sm;
  }

  // 分组复选框容器
  .group-checkboxes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  // 单个分组复选框标签样式
  .group-checkbox-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: $bg-tertiary;
    border: 1px solid $border;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: $font-size-sm;
    color: $text-secondary;
    transition: all 0.2s;

    // 鼠标悬停样式
    &:hover {
      border-color: $accent;
    }

    // 选中状态样式
    &.selected {
      background: rgba($accent, 0.15);
      border-color: $accent;
      color: $accent;
    }

    // 复选框样式
    input[type="checkbox"] {
      cursor: pointer;
      width: 14px;
      height: 14px;
      accent-color: $accent;
    }
  }

  // 清除选择按钮样式
  .clear-preview-btn {
    @include button-base;
    padding: 4px 12px;
    font-size: $font-size-sm;
    background: $bg-tertiary;
    color: $text-secondary;
    border: 1px solid $border;
    border-radius: $border-radius;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $bg-primary;
      color: $accent;
      border-color: $accent;
    }
  }
}
</style>
