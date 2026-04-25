<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  neutralText?: string
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'confirm': []
  'cancel': []
  'neutral': []
}>()

const buttonCount = computed(() => {
  let count = 0
  if (props.confirmText) count++
  if (props.cancelText) count++
  if (props.neutralText) count++
  return count
})

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function handleNeutral() {
  emit('neutral')
  emit('update:visible', false)
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="handleClose">&times;</button>
      </div>
      <div class="modal-body">
        <p v-for="(line, index) in message.split('\n').filter(l => l.trim())" :key="index" class="modal-line">{{ line }}</p>
      </div>
      <div class="modal-footer" :class="`btn-count-${buttonCount}`">
        <button v-if="neutralText" class="modal-btn modal-btn-neutral" @click="handleNeutral">{{ neutralText }}</button>
        <button v-if="cancelText" class="modal-btn modal-btn-cancel" @click="handleCancel">{{ cancelText }}</button>
        <button v-if="confirmText" class="modal-btn modal-btn-confirm" @click="handleConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.modal-overlay {
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

.modal-dialog {
  background: $bg-secondary;
  border: 1px solid $border;
  border-radius: $border-radius;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $border;

  h3 {
    color: $accent;
    margin: 0;
    font-size: $font-size-lg;
  }

  .modal-close {
    background: none;
    border: none;
    color: $text-secondary;
    font-size: $font-size-xl;
    cursor: pointer;

    &:hover {
      color: $accent;
    }
  }
}

.modal-body {
  padding: $spacing-lg;

  .modal-line {
    margin: $spacing-xs 0;
    color: $text-primary;
    line-height: 1.4;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding: $spacing-md;
  border-top: 1px solid $border;

  &.btn-count-1 {
    justify-content: center;
  }

  &.btn-count-2 {
    gap: $spacing-md;
  }

  &.btn-count-3 {
    gap: $spacing-sm;
  }
}

.modal-btn {
  @include button-base;
  font-size: $font-size-base;
  padding: $spacing-sm $spacing-xl;
  cursor: pointer;
  border-radius: $border-radius;
  font-weight: bold;

  &.modal-btn-confirm {
    background: $accent;
    border-color: $accent;
    color: white;

    &:hover {
      background: $accent-hover;
    }
  }

  &.modal-btn-cancel {
    background: $bg-tertiary;
    border-color: $border;
    color: $text-primary;

    &:hover {
      background: $bg-primary;
    }
  }

  &.modal-btn-neutral {
    background: $danger;
    border-color: $danger;
    color: white;

    &:hover {
      background: $danger-hover;
    }
  }
}
</style>
