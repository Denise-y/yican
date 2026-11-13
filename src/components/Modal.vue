<script setup lang="ts">
import X from './icons/X.vue'
defineProps<{ title: string; wide?: boolean; sheet?: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <view class="modal-backdrop" :class="{ 'sheet-backdrop': sheet }" @click.stop="emit('close')">
    <view class="modal" :class="{ wide, sheet }" role="dialog" :aria-label="title" @click.stop>
      <header class="modal-head el-header">
        <h2 class="el-h2">{{ title }}</h2>
        <button class="icon-btn" aria-label="关闭弹窗" @click.stop="emit('close')"><X :size="21" /></button>
      </header>
      <view class="modal-content"><slot /></view>
      <footer v-if="$slots.footer" class="modal-footer el-footer"><slot name="footer" /></footer>
    </view>
  </view>
</template>
