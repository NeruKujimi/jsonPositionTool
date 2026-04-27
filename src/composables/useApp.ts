/**
 * ========================================
 * useApp.ts - 应用级状态管理
 * ========================================
 * 
 * 【功能说明】
 * 管理应用级别的全局状态，包括BPM设置、时间单位、全屏状态等
 * 这些状态在应用的各个组件之间共享
 * 
 * 【包含状态】
 * - timeUnit: JSON输出时间单位（毫秒/秒）
 * - isFullscreen: 全屏模式状态
 * - bpm: 每分钟节拍数
 * - useBpmMode: 是否启用BPM模式
 * 
 * 【包含方法】
 * - toggleFullscreen: 切换全屏模式
 * 
 * 【使用示例】
 * ```ts
 * const { bpm, useBpmMode, timeUnit, isFullscreen, toggleFullscreen } = useApp()
 * ```
 */

import { ref, watch } from 'vue'

/**
 * 应用级状态组合式函数
 * @description 管理应用级别的全局状态
 */
export function useApp() {
  /**
   * JSON输出时间单位
   * @description 控制JSON中时间值的单位，可选值：
   * - 'milliseconds': 毫秒（如 1000）
   * - 'seconds': 秒（如 1.0）
   */
  const timeUnit = ref<'milliseconds' | 'seconds'>('seconds')

  /**
   * 全屏模式状态
   * @description 标识应用是否处于全屏显示模式
   */
  const isFullscreen = ref(false)

  /**
   * BPM（每分钟节拍数）
   * @description 用于BPM模式下的时间计算
   * @default 120
   */
  const bpm = ref(120)

  /**
   * BPM模式开关
   * @description 启用后，时间以节拍而非毫秒显示
   */
  const useBpmMode = ref(false)

  /**
   * 当前播放位置（毫秒）
   * @description 记录当前播放头的时间位置
   */
  const currentTimeMs = ref(0)

  /**
   * 切换全屏模式
   * @description 
   * - 如果当前不是全屏模式，请求进入全屏
   * - 如果当前是全屏模式，请求退出全屏
   * 使用标准的 Fullscreen API
   */
  function toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      // 当前不是全屏，请求进入全屏
      document.documentElement.requestFullscreen()
        .then(() => {
          isFullscreen.value = true
        })
        .catch((err) => {
          console.error('进入全屏失败:', err)
        })
    } else {
      // 当前是全屏模式，请求退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            isFullscreen.value = false
          })
          .catch((err) => {
            console.error('退出全屏失败:', err)
          })
      }
    }
  }

  /**
   * BPM值变化监听回调
   * @description 当BPM改变时自动调用，用于外部设置监听
   */
  let bpmChangeCallback: ((newBpm: number, oldBpm: number) => void) | null = null

  /**
   * BPM模式切换回调
   * @description 当BPM模式切换时自动调用，用于外部设置监听
   */
  let bpmModeChangeCallback: ((newMode: boolean) => void) | null = null

  /**
   * 设置BPM变化监听器
   * @param callback - BPM变化时的回调函数
   */
  function onBpmChange(callback: (newBpm: number, oldBpm: number) => void): void {
    bpmChangeCallback = callback
  }

  /**
   * 设置BPM模式切换监听器
   * @param callback - BPM模式切换时的回调函数
   */
  function onBpmModeChange(callback: (newMode: boolean) => void): void {
    bpmModeChangeCallback = callback
  }

  // 监听BPM变化，通知外部
  watch(bpm, (newBpm, oldBpm) => {
    if (bpmChangeCallback) {
      bpmChangeCallback(newBpm, oldBpm)
    }
  })

  // 监听BPM模式切换，通知外部
  watch(useBpmMode, (newMode) => {
    if (bpmModeChangeCallback) {
      bpmModeChangeCallback(newMode)
    }
  })

  return {
    // 状态
    timeUnit,
    isFullscreen,
    bpm,
    useBpmMode,
    currentTimeMs,

    // 方法
    toggleFullscreen,

    // 事件监听设置
    onBpmChange,
    onBpmModeChange,
  }
}
