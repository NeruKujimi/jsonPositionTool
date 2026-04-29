<script setup lang="ts">
/**
 * ========================================
 * BpmControl.vue - BPM模式控制组件
 * ========================================
 * 
 * 【组件说明】
 * 提供BPM模式的开关和BPM值输入功能
 * 
 * 【功能特性】
 * - BPM模式开关：启用后时间以节拍显示
 * - BPM值输入：仅在BPM模式下显示
 * 
 * 【使用方式】
 * ```vue
 * <BpmControl
 *   v-model:use-bpm-mode="useBpmMode"
 *   v-model:bpm="bpm"
 * />
 * ```
 */



/**
 * 定义组件接收的props
 */
const props = defineProps<{
  /** 是否启用BPM模式 */
  useBpmMode: boolean
  /** BPM值（每分钟节拍数） */
  bpm: number
  /** 拍数精度 */
  beatPrecision: number
}>()

/**
 * 定义组件发出的事件
 */
const emit = defineEmits<{
  /** 更新BPM模式状态 */
  'update:useBpmMode': [value: boolean]
  /** 更新BPM值 */
  'update:bpm': [value: number]
  /** 更新拍数精度 */
  'update:beatPrecision': [value: number]
  /** BPM值变化时触发（包含新旧值） */
  'bpmChange': [newBpm: number, oldBpm: number]
  /** BPM模式切换时触发 */
  'modeChange': [newMode: boolean]
}>()

/**
 * 切换BPM模式
 * @description 双向更新 useBpmMode 状态
 */
function toggleBpmMode() {
  emit('update:useBpmMode', !props.useBpmMode)
  emit('modeChange', !props.useBpmMode)
}

/**
 * 更新BPM值
 * @description 确保BPM值在有效范围内（1-300）
 */
function updateBpm(event: Event) {
  const target = event.target as HTMLInputElement
  let value = parseInt(target.value, 10)
  
  // 确保BPM值在有效范围内
  if (isNaN(value) || value < 1) {
    value = 1
  } else if (value > 300) {
    value = 300
  }
  
  const oldBpm = props.bpm
  emit('update:bpm', value)
  emit('bpmChange', value, oldBpm)
}

/**
 * 更新拍数精度
 * @description 从下拉框选择拍数精度
 */
function updateBeatPrecision(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = parseFloat(target.value)
  emit('update:beatPrecision', value)
}

/**
 * 拍数精度选项
 * @description 提供四种常用的拍数精度：1拍、半拍、四分之一拍、八分之一拍
 */
const precisionOptions = [
  { value: 1, label: '1' },
  { value: 0.5, label: '0.5' },
  { value: 0.25, label: '0.25' },
  { value: 0.125, label: '0.125' },
]
</script>

<template>
  <!-- BPM控制区域 -->
  <div class="bpm-control">
    <!-- BPM模式开关 -->
    <label class="bpm-toggle">
      <input 
        type="checkbox" 
        :checked="useBpmMode"
        @change="toggleBpmMode"
      />
      BPM模式
    </label>
    
    <!-- BPM值输入（仅在BPM模式下显示） -->
    <template v-if="useBpmMode">
      <label>BPM: </label>
      <input 
        type="number" 
        :value="bpm"
        @input="updateBpm"
        min="1" 
        max="300" 
        class="bpm-input"
      />
      <label>拍精度: </label>
      <select :value="beatPrecision" @change="updateBeatPrecision" class="bpm-input">
        <option v-for="option in precisionOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// BPM控制区域容器
.bpm-control {
  padding: 16px;
  background: $bg-secondary;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 12px;

  // 通用标签样式
  label {
    color: $text-secondary;
    font-weight: bold;
  }

  // BPM开关样式
  .bpm-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;

    &:hover {
      color: $accent;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: $accent;
    }
  }

  // BPM输入框样式
  .bpm-input {
    @include input-base;
    width: 80px;
    
    // Firefox 聚焦样式
    &:focus {
      outline: 2px solid $accent;
      outline-offset: 2px;
    }
  }

  // 下拉框样式
  select.bpm-input {
    cursor: pointer;
    padding: $spacing-sm;
  }
}
</style>
