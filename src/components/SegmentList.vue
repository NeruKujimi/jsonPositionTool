<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Segment, SegmentGroup } from '@/types'
import SegmentEditor from './SegmentEditor.vue'

const props = defineProps<{
  segments: Segment[]
  groups: SegmentGroup[]
  bpm: number
  useBpmMode: boolean
  vectorOps?: {
    mirrorHorizontal: (ids?: number[]) => void
    mirrorVertical: (ids?: number[]) => void
    mirrorDiagonal: (ids?: number[]) => void
    rotate: (angle: number, rotationCenter: 'start' | 'center' | 'end', ids?: number[]) => void
    translate: (dx: number, dy: number, ids?: number[]) => void
    scale: (sx: number, sy: number, ids?: number[]) => void
  }
}>()

const emit = defineEmits<{
  add: []
  remove: [id: number]
  update: [id: number, field: keyof Segment, value: number | string | boolean]
  'toggle-linked': [id: number, linked: boolean]
  'open-vector-modal': []
  'create-group': [name: string, segmentIds: number[]]
  'delete-group': [groupId: number]
  'update-group': [groupId: number, updates: Partial<SegmentGroup>]
  'add-segments-to-group': [groupId: number, segmentIds: number[]]
  'remove-segments-from-group': [groupId: number, segmentIds: number[]]
  'toggle-group-expand': [groupId: number]
  'remove-all-groups': []
}>()

const selectedSegmentIds = ref<number[]>([])
const creatingGroup = ref(false)
const newGroupName = ref('')
const showGroupEditMode = ref(false)

const groupedSegments = computed(() => {
  const result: Array<{ type: 'group', group: SegmentGroup } | { type: 'ungrouped', segments: Segment[] }> = []
  const groupedIds = new Set<number>()
  
  props.groups.forEach(group => {
    result.push({ type: 'group', group })
    group.segmentIds.forEach(id => groupedIds.add(id))
  })
  
  const ungrouped = props.segments.filter(s => !groupedIds.has(s.id))
  if (ungrouped.length > 0) {
    result.push({ type: 'ungrouped', segments: ungrouped })
  }
  
  return result
})

function toggleSegmentSelection(id: number) {
  const segmentIndex = props.segments.findIndex(s => s.id === id)
  const currentlySelected = selectedSegmentIds.value
  
  if (currentlySelected.includes(id)) {
    const minIdx = currentlySelected.reduce((min, sid) => {
      const idx = props.segments.findIndex(s => s.id === sid)
      return idx < min ? idx : min
    }, Infinity)
    const maxIdx = currentlySelected.reduce((max, sid) => {
      const idx = props.segments.findIndex(s => s.id === sid)
      return idx > max ? idx : max
    }, -Infinity)
    
    if (segmentIndex === minIdx || segmentIndex === maxIdx) {
      selectedSegmentIds.value = currentlySelected.filter(i => i !== id)
    } else {
      const newSelection = [...currentlySelected]
      for (let i = Math.min(segmentIndex, minIdx); i <= Math.max(segmentIndex, maxIdx); i++) {
        const seg = props.segments[i]
        if (seg && !newSelection.includes(seg.id)) {
          newSelection.push(seg.id)
        }
      }
      selectedSegmentIds.value = newSelection
    }
  } else {
    if (currentlySelected.length === 0) {
      selectedSegmentIds.value = [id]
    } else {
      const minIdx = currentlySelected.reduce((min, sid) => {
        const idx = props.segments.findIndex(s => s.id === sid)
        return idx < min ? idx : min
      }, Infinity)
      const maxIdx = currentlySelected.reduce((max, sid) => {
        const idx = props.segments.findIndex(s => s.id === sid)
        return idx > max ? idx : max
      }, -Infinity)
      
      const newSelection = [...currentlySelected]
      for (let i = Math.min(segmentIndex, minIdx); i <= Math.max(segmentIndex, maxIdx); i++) {
        const seg = props.segments[i]
        if (seg && !newSelection.includes(seg.id)) {
          newSelection.push(seg.id)
        }
      }
      selectedSegmentIds.value = newSelection
    }
  }
}

function startCreateGroup() {
  creatingGroup.value = true
  newGroupName.value = `分组 ${props.groups.length + 1}`
}

function cancelCreateGroup() {
  creatingGroup.value = false
  selectedSegmentIds.value = []
}

function finishCreateGroup() {
  if (newGroupName.value.trim() && selectedSegmentIds.value.length > 0) {
    emit('create-group', newGroupName.value.trim(), selectedSegmentIds.value)
    creatingGroup.value = false
    selectedSegmentIds.value = []
  }
}

function getSegmentIndex(seg: Segment) {
  return props.segments.findIndex(s => s.id === seg.id)
}
</script>

<template>
  <div class="segment-list">
    <div class="section-title">
      <span>事件</span>
      <div class="section-buttons">
        <button @click="emit('add')">+ 添加</button>
        <button @click="startCreateGroup" v-if="segments.length >= 2 && !creatingGroup">+ 创建分组</button>
        <button @click="emit('remove-all-groups')" v-if="groups.length > 0" class="remove-all-groups-btn">解除全部分组</button>
        <button @click="emit('open-vector-modal')" class="vector-modal-btn">统一事件操作</button>
      </div>
    </div>
    
    <div v-if="creatingGroup" class="create-group-panel">
      <div class="group-rule">提示：选择的事件必须连续，选中头尾事件后，中间的事件会自动包含</div>
      <input v-model="newGroupName" class="group-name-input" placeholder="分组名称" />
      <div class="selection-info">已选择 {{ selectedSegmentIds.length }} 个事件</div>
      <div class="create-group-buttons">
        <button @click="finishCreateGroup">创建</button>
        <button @click="cancelCreateGroup">取消</button>
      </div>
    </div>
    
    <div class="segments-container">
      <template v-for="item in groupedSegments" :key="item.type === 'group' ? item.group.id : 'ungrouped'">
        <template v-if="item.type === 'group'">
          <div class="group-header">
            <button @click="emit('toggle-group-expand', item.group.id)" class="expand-btn">
            {{ item.group.expanded ? '▼' : '▶' }}
          </button>
            <span class="group-name" @click="showGroupEditMode = !showGroupEditMode">
              <input v-if="showGroupEditMode" v-model="item.group.name" @blur="showGroupEditMode = false" class="group-name-edit" />
              <span v-else>{{ item.group.name }}</span>
            </span>
            <span class="group-count">({{ item.group.segmentIds.length }} 个事件)</span>
            <button @click="emit('delete-group', item.group.id)" class="delete-group-btn">解除分组</button>
          </div>
          <div v-if="item.group.expanded" class="group-segments">
            <SegmentEditor
              v-for="seg in segments.filter(s => item.group.segmentIds.includes(s.id))"
              :key="seg.id"
              :segment="seg"
              :index="getSegmentIndex(seg)"
              :is-first="false"
              :bpm="bpm"
              :use-bpm-mode="useBpmMode"
              :selectable="creatingGroup"
              :selected="selectedSegmentIds.includes(seg.id)"
              :vector-ops="vectorOps"
              @remove="emit('remove', $event)"
              @update="(id, field, value) => emit('update', id, field, value)"
              @toggle-linked="(id, linked) => emit('toggle-linked', id, linked)"
              @toggle-select="toggleSegmentSelection"
            />
          </div>
        </template>
        <template v-else>
          <div class="ungrouped-header">未分组</div>
          <div class="ungrouped-segments">
            <SegmentEditor
              v-for="seg in item.segments"
              :key="seg.id"
              :segment="seg"
              :index="getSegmentIndex(seg)"
              :is-first="getSegmentIndex(seg) === 0"
              :bpm="bpm"
              :use-bpm-mode="useBpmMode"
              :selectable="creatingGroup"
              :selected="selectedSegmentIds.includes(seg.id)"
              :vector-ops="vectorOps"
              @remove="emit('remove', $event)"
              @update="(id, field, value) => emit('update', id, field, value)"
              @toggle-linked="(id, linked) => emit('toggle-linked', id, linked)"
              @toggle-select="toggleSegmentSelection"
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.segment-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.section-title {
  @include flex-between;
  background: $bg-secondary;
  padding: $section-padding;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;

  .section-buttons {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  button {
    font-size: $font-size-base;
    padding: $spacing-sm $spacing-xl;
    cursor: pointer;
    background: $bg-tertiary;
    color: $accent;
    border: 1px solid $accent;
    border-radius: $border-radius;

    &:hover {
      background: $accent-hover;
    }
  }

  .vector-modal-btn {
    background: $bg-tertiary;
    color: $accent;
    border: 1px solid $accent;
  }

  .remove-all-groups-btn {
    background: $danger;
    color: white;
    border: 1px solid $danger;

    &:hover {
      background: $danger-hover;
    }
  }
}

.create-group-panel {
  padding: $spacing-md;
  background: $bg-secondary;
  border-bottom: 1px solid $border;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .group-rule {
    color: $accent;
    font-size: $font-size-sm;
    padding: $spacing-sm;
    background: rgba($accent, 0.1);
    border: 1px solid rgba($accent, 0.3);
    border-radius: $border-radius;
  }

  .group-name-input {
    @include input-base;
  }

  .selection-info {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .create-group-buttons {
    display: flex;
    gap: $spacing-md;

    button {
      font-size: $font-size-base;
      padding: $spacing-sm $spacing-xl;
      cursor: pointer;
      background: $bg-tertiary;
      color: $accent;
      border: 1px solid $accent;
      border-radius: $border-radius;

      &:hover {
        background: $accent-hover;
      }
    }
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $border-radius;
  margin-bottom: $spacing-sm;
  cursor: pointer;
  user-select: none;

  .expand-btn {
    background: none;
    border: none;
    color: $accent;
    font-size: $font-size-base;
    cursor: pointer;
    padding: 0;
  }

  .group-name {
    flex: 1;
    font-weight: bold;
    color: $accent;
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .group-name-edit {
      @include input-base;
      width: 150px;
    }
  }

  .group-count {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .delete-group-btn {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
    background: $danger-bg;
    color: $danger;
    border: 1px solid $danger;
    border-radius: $border-radius;
    cursor: pointer;

    &:hover {
      background: $danger-hover;
    }
  }
}

.group-segments {
  margin-left: $spacing-lg;
  margin-bottom: $spacing-md;
  padding-left: $spacing-md;
  border-left: 2px solid $border;
}

.ungrouped-header {
  padding: $spacing-md;
  color: $text-secondary;
  font-size: $font-size-sm;
  border-bottom: 1px dashed $border;
}

.segments-container {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  min-height: 0;
}
</style>
