<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  execute: [operation: string, params: any]
}>()

const selectedOperation = ref('mirrorHorizontal')
const rotateAngle = ref(90)
const rotationCenter = ref<'start' | 'center' | 'end'>('center')
const translateX = ref(0)
const translateY = ref(0)
const scaleX = ref(1)
const scaleY = ref(1)

function handleExecute() {
  let params: any = {}
  
  switch (selectedOperation.value) {
    case 'mirrorHorizontal':
    case 'mirrorVertical':
    case 'mirrorDiagonal':
      break
    case 'rotate':
      params = { angle: rotateAngle.value, rotationCenter: rotationCenter.value }
      break
    case 'translate':
      params = { dx: translateX.value, dy: translateY.value }
      break
    case 'scale':
      params = { sx: scaleX.value, sy: scaleY.value }
      break
  }
  
  emit('execute', selectedOperation.value, params)
  emit('update:visible', false)
}

function handleCancel() {
  emit('update:visible', false)
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <div v-if="visible" class="vector-modal-overlay" @click="handleClose">
    <div class="vector-modal" @click.stop>
      <div class="modal-header">
        <h3>统一事件操作</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>操作类型</label>
          <select v-model="selectedOperation" class="form-select">
            <option value="mirrorHorizontal">水平镜像</option>
            <option value="mirrorVertical">垂直镜像</option>
            <option value="mirrorDiagonal">对角镜像</option>
            <option value="rotate">旋转</option>
            <option value="translate">平移</option>
            <option value="scale">缩放</option>
          </select>
        </div>
        
        <!-- 旋转参数 -->
        <div v-if="selectedOperation === 'rotate'" class="form-group">
          <label>旋转角度</label>
          <input type="number" v-model.number="rotateAngle" step="15" class="form-input" />
          <label>旋转中心</label>
          <select v-model="rotationCenter" class="form-select">
            <option value="start">绕起点</option>
            <option value="center">绕中心</option>
            <option value="end">绕终点</option>
          </select>
        </div>
        
        <!-- 平移参数 -->
        <div v-if="selectedOperation === 'translate'" class="form-group">
          <label>X轴偏移</label>
          <input type="number" v-model.number="translateX" step="0.5" class="form-input" />
          <label>Y轴偏移</label>
          <input type="number" v-model.number="translateY" step="0.5" class="form-input" />
        </div>
        
        <!-- 缩放参数 -->
        <div v-if="selectedOperation === 'scale'" class="form-group">
          <label>X轴缩放</label>
          <input type="number" v-model.number="scaleX" step="0.1" class="form-input" />
          <label>Y轴缩放</label>
          <input type="number" v-model.number="scaleY" step="0.1" class="form-input" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-execute" @click="handleExecute">执行</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.vector-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.vector-modal {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: $border-radius;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1px solid $border;

    h3 {
      margin: 0;
      color: $accent;
      font-size: $font-size-lg;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: $font-size-xl;
      color: $text-secondary;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: $accent;
      }
    }
  }

  .modal-body {
    padding: $spacing-lg;

    .form-group {
      margin-bottom: $spacing-md;

      label {
        display: block;
        color: $text-secondary;
        font-size: $font-size-sm;
        margin-bottom: $spacing-xs;
      }

      .form-input,
      .form-select {
        @include input-base;
        width: 100%;
        margin-bottom: $spacing-sm;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    padding: $spacing-md;
    border-top: 1px solid $border;

    .btn-cancel,
    .btn-execute {
      padding: $spacing-sm $spacing-xl;
      border-radius: $border-radius;
      cursor: pointer;
      font-size: $font-size-base;
      font-weight: bold;
    }

    .btn-cancel {
      background: $bg-tertiary;
      color: $text-secondary;
      border: 1px solid $border;

      &:hover {
        background: $bg-primary;
      }
    }

    .btn-execute {
      background: $accent;
      color: white;
      border: 1px solid $accent;

      &:hover {
        background: $accent-hover;
      }
    }
  }
}
</style>