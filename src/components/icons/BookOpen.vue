<script setup lang="ts">
import IconGlyph from '../IconGlyph.vue'
withDefaults(defineProps<{ size?: number | string; strokeWidth?: number | string }>(), { size: 24, strokeWidth: 2 })
const glyph = '\ue05f'
</script>

<template>
  <IconGlyph :glyph="glyph" :size="size" />
</template>
