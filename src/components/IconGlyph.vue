<script setup lang="ts">
defineProps<{ glyph: string; size?: number | string }>()
</script>

<template>
  <text class="yican-icon" :style="{ fontSize: typeof size === 'number' ? size + 'px' : size || '24px' }">{{ glyph }}</text>
</template>
