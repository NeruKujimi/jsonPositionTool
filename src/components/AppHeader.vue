<script setup lang="ts">
/**
 * ========================================
 * AppHeader.vue - 应用头部组件
 * ========================================
 * 
 * 【组件说明】
 * 应用的头部区域，包含标题和操作按钮
 * 
 * 【功能特性】
 * - 应用标题显示
 * - 清空已保存按钮（仅当有保存数据时显示）
 * - 全屏切换按钮
 * - 退出按钮
 * 
 * 【使用方式】
 * ```vue
 * <AppHeader
 *   :has-saved-state="hasSavedState"
 *   :is-fullscreen="isFullscreen"
 *   @clear="handleClear"
 *   @fullscreen="handleFullscreen"
 *   @exit="handleExit"
 * />
 * ```
 */

/**
 * 定义组件接收的props
 */
defineProps<{
  /** 是否存在已保存的状态 */
  hasSavedState: boolean
  /** 是否处于全屏模式 */
  isFullscreen: boolean
}>()

/**
 * 定义组件发出的事件
 */
const emit = defineEmits<{
  /** 清空已保存数据 */
  'clear': []
  /** 切换全屏模式 */
  'fullscreen': []
  /** 退出应用 */
  'exit': []
}>()

/**
 * 处理清空已保存数据
 */
function handleClear() {
  emit('clear')
}

/**
 * 处理全屏切换
 */
function handleFullscreen() {
  emit('fullscreen')
}

/**
 * 处理退出
 */
function handleExit() {
  emit('exit')
}
</script>

<template>
  <!-- 应用头部 -->
  <header class="app-header">
    <!-- 应用标题 -->
    <h1>Position工具</h1>
    
    <!-- 操作按钮区域 -->
    <div class="header-buttons">
      <!-- 清空已保存按钮（仅在有保存数据时显示） -->
      <button 
        v-if="hasSavedState" 
        @click="handleClear" 
        class="clear-button"
      >
        清空已保存
      </button>
      
      <!-- 全屏切换按钮 -->
      <button 
        class="fullscreen-button" 
        @click="handleFullscreen"
      >
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
      
      <!-- 退出按钮 -->
      <button 
        class="exit-button" 
        @click="handleExit"
      >
        退出
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// 应用头部容器
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: $bg-secondary;
  border-bottom: 2px solid $border;

  // 标题样式
  h1 {
    color: $accent;
    font-size: $font-size-lg;
    margin: 0;
  }

  // 按钮区域
  .header-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  // 清空已保存按钮
  .clear-button {
    background: $accent;
    color: white;
    border: 1px solid $accent;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;
    transition: background-color 0.2s;

    &:hover {
      background: $accent-hover;
    }
  }

  // 退出按钮
  .exit-button {
    background: $danger;
    color: white;
    border: 1px solid $danger;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;
    transition: background-color 0.2s;

    &:hover {
      background: $danger-hover;
    }
  }

  // 全屏切换按钮
  .fullscreen-button {
    background: transparent;
    color: $danger;
    border: 1px solid $danger;
    padding: $spacing-sm $spacing-xl;
    border-radius: $border-radius;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-base;
    transition: all 0.2s;

    &:hover {
      background: $danger;
      color: white;
    }
  }
}
</style>
