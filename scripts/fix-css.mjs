import fs from 'node:fs'
import path from 'node:path'

// svg 选择器 → .yican-icon（跳过字符串/URL/文件名中的 svg）
const re = /(?<![\w./"'—-])svg(?![\w+.)"'\-])/g

const cssFiles = ['style.css', 'themes.css', 'mobile-warm.css', 'journal.css', 'account.css', 'reviews.css']
for (const f of cssFiles) {
  const p = path.join('D:/yican-miniprogram/src', f)
  const t = fs.readFileSync(p, 'utf8')
  const t2 = t.replace(re, '.yican-icon')
  if (t2 !== t) {
    fs.writeFileSync(p, t2)
    console.log('css updated:', f, (t.match(re) || []).length, '处')
  }
}

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.vue')) processVue(p)
  }
}
function processVue(p) {
  const t = fs.readFileSync(p, 'utf8')
  let changed = false
  const out = t.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, b, c) => {
    const n = b.replace(re, '.yican-icon')
    if (n !== b) changed = true
    return a + n + c
  })
  if (changed) {
    fs.writeFileSync(p, out)
    console.log('vue style updated:', path.basename(p))
  }
}
walk('D:/yican-miniprogram/src')

// 注入 @font-face（若不存在）
const stylePath = 'D:/yican-miniprogram/src/style.css'
let style = fs.readFileSync(stylePath, 'utf8')
if (!style.includes('yican-lucide')) {
  const inject = `@font-face{font-family:'yican-lucide';src:url('/static/yican-icons.ttf') format('truetype');font-weight:normal;font-style:normal;font-display:block}
.yican-icon{font-family:'yican-lucide';font-weight:normal;font-style:normal;line-height:1;display:inline-block;vertical-align:-0.125em;font-size:24px;letter-spacing:0;flex-shrink:0}
`
  fs.writeFileSync(stylePath, inject + style)
  console.log('font-face injected')
}

// 校验
const fa = fs.readFileSync('D:/yican-miniprogram/src/components/FoodArt.vue', 'utf8')
console.log('FoodArt svg+xml intact:', fa.includes('image/svg+xml'))
const s = fs.readFileSync(stylePath, 'utf8')
console.log('style.css remaining standalone svg:', (s.match(re) || []).length)
