<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { API_BASE } from '../config'
const props = defineProps<{ kind?: string; reference?: boolean; alt?: string }>()
const photo = computed(() => props.kind?.startsWith('/images/') || props.kind?.startsWith('http'))
/** 小程序 <image> 不会把 /images/… 当网络地址；需拼成绝对 URL 才能从本机服务加载。 */
const photoSrc = computed(() => {
  const kind = props.kind ?? ''
  if (kind.startsWith('http')) return kind
  if (kind.startsWith('/images/')) return API_BASE + kind
  return kind
})

/** 小程序无 <svg>：把插画拼成 SVG 字符串再转 data URI，交给 <image> 渲染。 */
const pieces = Array.from({ length: 15 }, (_, i) => ({
  x: 55 + ((i * 47) % 125),
  y: 53 + ((i * 31) % 95),
  r: (i * 61) % 180,
}))

const artSvg = computed(() => {
  const kind = props.kind ?? 'default'
  if ((photo.value && !photoFailed.value) || kind === 'svg-off') return ''
  let inner = ''
  if (kind === 'placeholder') {
    inner = `
      <circle cx="120" cy="82" r="47" fill="currentColor" opacity=".05"/>
      <circle cx="120" cy="82" r="34" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".25"/>
      <circle cx="120" cy="82" r="26" fill="none" stroke="currentColor" stroke-width="1" opacity=".12"/>
      <path d="M64 60v17q0 6 5 6t5-6V60M69 60v49M178 60q-9 8-9 23h9m0-23v49" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>`
  } else {
    inner += `
      <ellipse cx="123" cy="110" rx="91" ry="74" fill="#433829" opacity=".08"/>
      <ellipse cx="120" cy="98" rx="91" ry="76" fill="#fdfbf6"/>
      <ellipse cx="120" cy="98" rx="76" ry="62" fill="#e9e5d8"/>
      <ellipse cx="120" cy="98" rx="72" ry="58" fill="${kind === 'soup' ? '#da8a54' : '#f3e4c7'}"/>`
    if (kind === 'tomato' || kind === 'soup') {
      pieces.slice(0, 8).forEach((p) => {
        inner += `<path d="M ${p.x - 10} ${p.y} Q ${p.x} ${p.y - 21} ${p.x + 19} ${p.y - 3} L ${p.x + 8} ${p.y + 17} Q ${p.x - 8} ${p.y + 14} ${p.x - 10} ${p.y}" fill="#cc583b" stroke="#e5774e" stroke-width="3"/>`
      })
      pieces.slice(7).forEach((p, i) => {
        inner += `<path d="M ${p.x - 9} ${p.y - 7} Q ${p.x + 3} ${p.y - 13} ${p.x + 19} ${p.y - 6} L ${p.x + 13} ${p.y + 13} L ${p.x - 11} ${p.y + 9}Z" fill="${kind === 'soup' ? '#f3e9cd' : '#f0c754'}" stroke="#f6d981" stroke-width="2"/>`
      })
    } else if (kind === 'shrimp') {
      pieces.slice(0, 9).forEach((p) => {
        inner += `<g transform="translate(${p.x},${p.y}) rotate(${p.r})"><path d="M 8 -12 C -17 -22 -23 17 1 16 C 15 16 18 2 10 -2" fill="none" stroke="#db8653" stroke-width="14" stroke-linecap="round"/><path d="M 6 -12 C -13 -15 -13 12 0 11" fill="none" stroke="#f5b582" stroke-width="7" stroke-linecap="round"/></g>`
      })
    } else if (kind === 'tofu') {
      pieces.slice(0, 10).forEach((p) => {
        inner += `<g transform="translate(${p.x},${p.y}) rotate(${p.r / 4})"><rect x="-15" y="-13" width="32" height="26" rx="5" fill="#cd8c3e" stroke="#efd393" stroke-width="3"/><path d="M-8 -6L10 -6M-9 1L9 1" stroke="#dfad68" stroke-width="2"/></g>`
      })
    } else {
      pieces.forEach((p, i) => {
        const body =
          kind === 'beef' && i % 2 === 0
            ? `<path d="M-16 -9 Q-3 -19 15 -5 L12 10 Q-5 15 -17 6Z" fill="#976046" stroke="#bc8260" stroke-width="3"/>`
            : `<path d="M0 15L0 -6" stroke="#a4b067" stroke-width="7"/><ellipse cx="-7" cy="-5" rx="10" ry="14" fill="#71884b"/><ellipse cx="7" cy="-8" rx="11" ry="14" fill="#88984e"/><path d="M0 -14L0 3" stroke="#b8bc78" stroke-width="2"/>`
        inner += `<g transform="translate(${p.x},${p.y}) rotate(${p.r})">${body}</g>`
      })
    }
    pieces.slice(2, 11).forEach((p) => {
      inner += `<path d="M${p.x} ${p.y}l7 -3 -3 7Z" fill="#607a48"/>`
    })
    inner += `<ellipse cx="79" cy="57" rx="21" ry="7" fill="#fff" opacity=".15" transform="rotate(-30 79 57)"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="240" height="200">${inner}</svg>`
  return 'data:image/svg+xml;base64,' + utf8ToBase64(svg)
})

function utf8ToBase64(str: string): string {
  // 小程序环境无 btoa，手工 UTF-8 → base64。
  const utf8 = unescape(encodeURIComponent(str))
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  for (let i = 0; i < utf8.length; i += 3) {
    const c1 = utf8.charCodeAt(i)
    const c2 = i + 1 < utf8.length ? utf8.charCodeAt(i + 1) : NaN
    const c3 = i + 2 < utf8.length ? utf8.charCodeAt(i + 2) : NaN
    const e1 = c1 >> 2
    const e2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4)
    result += chars[e1] + chars[e2] + (isNaN(c2) ? '=' : chars[((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6)]) + (isNaN(c3) ? '=' : chars[c3 & 63])
  }
  return result
}

/** 网络图失败时回退插画，避免小程序把 /images/… 当包内路径刷 500。 */
const photoFailed = ref(false)
function onPhotoError() {
  photoFailed.value = true
}
watch(
  () => props.kind,
  () => {
    photoFailed.value = false
  }
)

const label = computed(
  () =>
    (props.alt ?? ((photo.value && !photoFailed.value) || photoFailed.value ? '菜品封面' : '菜品示意插画')) +
    (props.kind === 'placeholder' ? '，实拍待补充' : '') +
    (props.reference ? '，仅供参考' : '')
)
</script>

<template>
  <view
    class="food-art"
    :class="{ 'food-photo': photo && !photoFailed, 'food-missing': kind === 'placeholder' }"
    role="img"
    :aria-label="label"
    :data-cover-reference="reference || undefined"
  >
    <image v-if="photo && !photoFailed" :src="photoSrc" mode="aspectFill" class="food-img" @error="onPhotoError" />
    <image v-else-if="artSvg" :src="artSvg" mode="aspectFit" class="food-img" :class="{ 'food-placeholder-img': kind === 'placeholder' }" />
    <small v-if="kind === 'placeholder'" class="food-placeholder-caption el-small" aria-hidden="true">实拍待补充</small>
    <small v-if="reference" class="cover-reference el-small" aria-hidden="true">仅供参考</small>
  </view>
</template>

<style scoped>
.food-art {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
  width: 240px;
  height: 200px;
  max-width: 100%;
}
.food-img {
  display: block;
  width: 100%;
  height: 100%;
}
.food-placeholder-caption {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 33px;
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 1px;
  color: var(--muted, #8a8275);
}
.cover-reference {
  position: absolute;
  bottom: 9px;
  left: 9px;
  padding: 3px 7px;
  border-radius: 5px;
  background: rgba(35, 32, 27, 0.72);
  color: #fffaf3;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.5;
  white-space: nowrap;
}
</style>
