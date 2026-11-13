import fs from 'node:fs'
const t = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
const a = t.indexOf('class="shopping-row"')
const b = t.indexOf('</label>', t.indexOf('ingredient-amount', a))
console.log('=== shopping-row block ===')
console.log(JSON.stringify(t.slice(a - 60, b + 400)))
const c = t.indexOf('<div class="chef-layout">')
console.log('\n=== chef-layout opening ===')
console.log(JSON.stringify(t.slice(c, c + 140)))
// el- prefix collision
console.log('\nel- classes in src templates:', (t.match(/class="[^"]*el-[a-z]/g) || []).length)
