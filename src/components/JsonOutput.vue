<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  json: string
}>()

const copied = ref(false)

function copyToClipboard() {
  navigator.clipboard.writeText(props.json).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1200)
  })
}
</script>

<template>
  <div class="json-section">
    <div class="section-title">
      <span>JSON Output</span>
      <button @click="copyToClipboard">{{ copied ? 'Copied!' : 'Copy' }}</button>
    </div>
    <textarea class="json-output" :value="json" readonly></textarea>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.json-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  @include flex-between;
  background: $bg-secondary;
  padding: $section-padding;
  font-size: $font-size-lg;
  color: $accent;
  border-bottom: 1px solid $border;

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

.json-output {
  flex: 1;
  background: $bg-canvas;
  border: none;
  color: #58a6ff;
  font-family: $font-mono;
  font-size: $font-size-base;
  padding: $spacing-lg;
  resize: none;
  outline: none;
  line-height: 1.5;
}
</style>