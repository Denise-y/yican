<script setup lang="ts">
import { computed } from 'vue'
import IconGlyph from './IconGlyph.vue'
import codes from '../icon-codes.json'

export interface YiOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue?: string
  options: YiOption[]
  disabled?: boolean
  ariaLabel?: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()

const range = computed(() => props.options.map((o) => o.label))

const currentLabel = computed(() => {
  const hit = props.options.find((o) => o.value === props.modelValue)
  if (hit) return hit.label
  return props.modelValue || props.placeholder || ''
})

const currentIndex = computed(() => {
  const i = props.options.findIndex((o) => o.value === props.modelValue)
  return i < 0 ? 0 : i
})

function onChange(e: { detail: { value: number } }) {
  const opt = props.options[Number(e.detail.value)]
  if (!opt || opt.value === props.modelValue) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
}
</script>

<template>
  <picker
    class="yican-select"
    :class="{ 'yican-select-disabled': disabled }"
    :range="range"
    :value="currentIndex"
    :disabled="disabled"
    @change="onChange"
  >
    <view class="yican-select-inner" :aria-label="ariaLabel">
      <text class="yican-select-text" :class="{ placeholder: !currentLabel }">{{ currentLabel }}</text>
      <IconGlyph class="yican-select-arrow" :glyph="codes.ChevronDown" :size="16" />
    </view>
  </picker>
</template>
