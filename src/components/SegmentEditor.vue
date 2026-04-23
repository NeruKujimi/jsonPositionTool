<template>
  <div class="segment-editor">
    <!-- 组件内容 -->
  </div>
</template>

<script>
export default {
  name: 'SegmentEditor'
}
</script>

<style lang="scss">
@import '../styles/_mixins.scss';

.segment-editor {
  @include input-base();
  // 其他样式...
}
</style>