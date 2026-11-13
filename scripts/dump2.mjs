import fs from 'node:fs'
const t = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
const i = t.indexOf('class="menu-layout"')
console.log(t.slice(i, i + 3000))
console.log('\n==== chef-layout ====')
const j = t.indexOf('class="chef-layout"')
console.log(t.slice(j, j + 1200))
