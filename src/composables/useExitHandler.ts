/**
 * ========================================
 * useExitHandler.ts - 退出处理和状态保存
 * ========================================
 * 
 * 【功能说明】
 * 处理应用退出逻辑，包括保存状态提示和实际退出操作
 * 
 * 【使用场景】
 * 用户点击"退出"按钮时，显示保存配置对话框
 * 根据用户选择决定是否保存当前配置，然后关闭应用
 * 
 * 【退出选项】
 * - 保存退出：保存当前所有配置到本地存储，下次启动时自动加载
 * - 不保存退出：清除本地存储的保存状态，直接退出
 * - 取消：关闭对话框，不执行退出
 * 
 * 【技术实现】
 * - 使用 localStorage 持久化保存配置
 * - 配置包含：segments、groups、bpm、useBpmMode
 * - Electron 环境使用 electron.app.quit() 退出
 * - 浏览器环境使用 window.location.reload() 模拟退出
 * 
 * 【使用示例】
 * ```ts
 * const { handleExit, handleExitConfirm, handleExitCancel, handleExitNeutral } = useExitHandler({
 *   onSave: () => saveState(...),
 *   onQuit: () => electron.app.quit()
 * })
 * ```
 */

import { ref } from 'vue'

/**
 * 退出处理参数接口
 * @description 定义退出处理所需的回调函数
 */
export interface ExitHandlerOptions {
  /** 保存并退出时调用的回调 */
  onSave: () => void
  /** 直接退出时调用的回调 */
  onQuit: () => void
  /** 重置应用状态的回调（用于清空已保存数据后重载） */
  onReset?: () => void
}

/**
 * 退出处理组合式函数
 * @description 管理退出对话框的状态和退出操作
 * @param options - 退出处理所需的回调函数
 */
export function useExitHandler(options: ExitHandlerOptions) {
  /**
   * 退出对话框显示状态
   * @description true 显示对话框，false 隐藏对话框
   */
  const showExitModal = ref(false)

  /**
   * 显示退出对话框
   * @description 用户点击退出按钮时调用，打开确认对话框
   */
  function handleExit(): void {
    showExitModal.value = true
  }

  /**
   * 确认保存并退出
   * @description 
   * - 用户选择"是"时调用
   * - 执行保存当前配置
   * - 然后执行退出
   */
  function handleExitConfirm(): void {
    // 执行保存回调
    options.onSave()
    // 执行退出回调
    options.onQuit()
  }

  /**
   * 不保存直接退出
   * @description 
   * - 用户选择"否"时调用
   * - 不保存配置，直接退出
   */
  function handleExitCancel(): void {
    options.onQuit()
  }

  /**
   * 取消退出
   * @description 
   * - 用户选择"取消"或点击对话框关闭按钮时调用
   * - 仅关闭对话框，不执行任何操作
   */
  function handleExitNeutral(): void {
    showExitModal.value = false
  }

  /**
   * 清空已保存数据并重载
   * @description 
   * - 清除本地存储的保存状态
   * - 重置应用状态
   * - 重新加载页面
   */
  function handleClearAndReload(): void {
    if (options.onReset) {
      options.onReset()
    }
    window.location.reload()
  }

  return {
    // 状态
    showExitModal,
    
    // 处理函数
    handleExit,
    handleExitConfirm,
    handleExitCancel,
    handleExitNeutral,
    handleClearAndReload,
  }
}
