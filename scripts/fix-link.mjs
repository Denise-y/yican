import fs from 'node:fs'
let n = 0
for (const p of ['D:/yican-miniprogram/src/MainView.vue', 'D:/yican-miniprogram/src/components/KitchenManagement.vue']) {
  let t = fs.readFileSync(p, 'utf8')
  const before = t
  // stamp script wrote `<Link .../ class="el-link">` (class after self-closing slash) -> restore `/>`
  t = t.replace(/\/\s*class="el-link">/g, '/>')
  if (t !== before) n++
  fs.writeFileSync(p, t)
}
console.log('cleaned files:', n)
