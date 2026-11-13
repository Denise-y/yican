<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  mode: 'date' | 'time'
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(e: { detail: { value: string } }) {
  const v = e.detail && e.detail.value
  if (v) emit('update:modelValue', v)
}
</script>

<template>
  <picker
    class="yican-picker-input"
    :class="{ 'yican-picker-disabled': disabled }"
    :mode="mode"
    :value="modelValue"
    :disabled="disabled"
    @change="onChange"
  >
    <view class="yican-picker-input-inner" :class="{ empty: !modelValue }" :aria-label="ariaLabel">
      <text>{{ modelValue || placeholder || '请选择' }}</text>
    </view>
  </picker>
</template>
