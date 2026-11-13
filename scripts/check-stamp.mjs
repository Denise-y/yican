import fs from 'node:fs'
const t = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
for (const s of ['<main', '<header', 'app-footer', 'ingredient-mid', 'chef-main', '<nav']) {
  const i = t.indexOf(s)
  console.log('==', s, '==')
  console.log(i >= 0 ? t.slice(Math.max(0, i - 30), i + 160).replace(/\r?\n/g, ' ') : 'NOT FOUND')
}
const bad = t.match(/class="[^"]*"[a-z-]+="/g)
console.log('attr anomalies:', (bad || []).length, (bad || []).slice(0, 5))
const dup = t.match(/class="[^"]*\bel-(\w+) [^"]*\bel-\1\b[^"]*"/g)
console.log('dup tokens:', (dup || []).length, (dup || []).slice(0, 3))
