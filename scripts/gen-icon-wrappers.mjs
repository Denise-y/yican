// Generate one .vue wrapper per lucide icon so uni-app registers each tag
// in usingComponents (only .vue imports are registered; lucide-shim.ts was not).
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const codes = JSON.parse(fs.readFileSync(path.join(root, 'src/icon-codes.json'), 'utf8'))
const dir = path.join(root, 'src/components/icons')
fs.mkdirSync(dir, { recursive: true })

let n = 0
for (const [name, glyph] of Object.entries(codes)) {
  const esc = Array.from(glyph)
    .map((c) => '\\u' + c.codePointAt(0).toString(16).padStart(4, '0'))
    .join('')
  const content = [
    `<script setup lang="ts">`,
    `import IconGlyph from '../IconGlyph.vue'`,
    `withDefaults(defineProps<{ size?: number | string; strokeWidth?: number | string }>(), { size: 24, strokeWidth: 2 })`,
    `const glyph = '${esc}'`,
    `</script>`,
    ``,
    `<template>`,
    `  <IconGlyph :glyph="glyph" :size="size" />`,
    `</template>`,
    ``,
  ].join('\n')
  fs.writeFileSync(path.join(dir, `${name}.vue`), content, 'utf8')
  n++
}
console.log(`generated ${n} icon wrappers in src/components/icons`)
