<script setup lang="ts">
import { computed } from 'vue'
import IconGlyph from './IconGlyph.vue'
import codes from '../icon-codes.json'

const props = defineProps<{
  modelValue?: boolean
  checked?: boolean
  disabled?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; change: [value: boolean] }>()

const on = computed(() => props.modelValue ?? props.checked ?? false)

function toggle() {
  if (props.disabled) return
  const next = !on.value
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <view class="yican-check" @tap="toggle">
    <view class="yican-check-box" :class="{ on: on, disabled: disabled }" :aria-label="ariaLabel" :aria-checked="on">
      <IconGlyph v-if="on" class="yican-check-mark" :glyph="codes.Check" :size="14" />
    </view>
  </view>
</template>
