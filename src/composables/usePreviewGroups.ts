/**
 * ========================================
 * usePreviewGroups.ts - 分组预览选择状态管理
 * ========================================
 * 
 * 【功能说明】
 * 管理分组预览选择的状态和逻辑，支持连续选择多个分组
 * 
 * 【使用场景】
 * 当用户需要预览多个分组的合并效果时使用
 * 例如：选中分组1和3时，自动包含分组2，形成1-2-3的连续预览
 * 
 * 【核心概念】
 * - selectedGroupIds: 当前选中的分组ID列表
 * - 连续选择规则：选中头尾分组后，中间分组自动包含
 * - 取消选择规则：只能从边界（最早或最晚选中的分组）开始取消
 * 
 * 【使用示例】
 * ```ts
 * const { selectedGroupIds, toggleGroupSelection, clearSelection, isGroupSelected } = usePreviewGroups()
 * ```
 */

import { ref, computed } from 'vue'

/**
 * 分组预览选择组合式函数
 * @description 管理分组预览选择的状态和逻辑
 */
export function usePreviewGroups() {
  /**
   * 当前选中的分组ID列表
   * @description 用于追踪用户选择的分组，支持连续选择
   */
  const selectedGroupIds = ref<number[]>([])

  /**
   * 检查指定分组是否被选中
   * @param groupId - 分组ID
   * @returns 是否选中
   */
  function isGroupSelected(groupId: number): boolean {
    return selectedGroupIds.value.includes(groupId)
  }

  /**
   * 切换分组选择状态
   * @description 
   * - 如果分组已选中：
   *   - 如果是边界分组（最早或最晚），则取消选择该分组
   *   - 如果是中间分组，则只保留边界分组的选中状态
   * - 如果分组未选中：
   *   - 如果没有选中任何分组，则直接选中该分组
   *   - 如果已有选中分组，则选中新分组与现有边界之间的所有分组
   * 
   * @param groupId - 要切换的分组ID
   */
  function toggleGroupSelection(groupId: number): void {
    const currentlySelected = selectedGroupIds.value
    
    if (currentlySelected.includes(groupId)) {
      // 分组已被选中，处理取消选择逻辑
      // 计算当前选中的最小和最大分组ID
      const minId = currentlySelected.reduce((min, id) => Math.min(min, id), Infinity)
      const maxId = currentlySelected.reduce((max, id) => Math.max(max, id), -Infinity)
      
      if (groupId === minId || groupId === maxId) {
        // 点击的是边界分组，取消选择该分组
        selectedGroupIds.value = currentlySelected.filter(id => id !== groupId)
      } else {
        // 点击的是中间分组，只保留边界分组
        const newSelection: number[] = []
        for (let i = Math.min(groupId, minId); i <= Math.max(groupId, maxId); i++) {
          if (currentlySelected.includes(i)) {
            newSelection.push(i)
          }
        }
        selectedGroupIds.value = newSelection
      }
    } else {
      // 分组未被选中，处理选中逻辑
      if (currentlySelected.length === 0) {
        // 没有选中任何分组，直接选中
        selectedGroupIds.value = [groupId]
      } else {
        // 已有选中分组，选中所有中间的分组
        const minId = Math.min(...currentlySelected)
        const maxId = Math.max(...currentlySelected)
        const newSelection: number[] = []
        for (let i = Math.min(groupId, minId); i <= Math.max(groupId, maxId); i++) {
          newSelection.push(i)
        }
        selectedGroupIds.value = newSelection
      }
    }
  }

  /**
   * 清除所有分组选择
   * @description 将选中列表置空，恢复显示所有分组
   */
  function clearSelection(): void {
    selectedGroupIds.value = []
  }

  /**
   * 设置选中的分组列表
   * @description 用于外部设置选中的分组（如加载保存的状态）
   * @param groupIds - 分组ID数组
   */
  function setSelectedGroups(groupIds: number[]): void {
    selectedGroupIds.value = groupIds
  }

  /**
   * 获取选中的分组数量
   * @description 计算属性，返回当前选中的分组数量
   */
  const selectedCount = computed(() => selectedGroupIds.value.length)

  return {
    selectedGroupIds,
    isGroupSelected,
    toggleGroupSelection,
    clearSelection,
    setSelectedGroups,
    selectedCount,
  }
}
