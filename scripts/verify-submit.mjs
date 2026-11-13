import fs from 'node:fs'

const base = 'D:/yican-miniprogram/dist/build/mp-weixin/'
const files = ['components/AuthScreen.wxml', 'components/ReviewCenter.wxml', 'MainView.wxml']
let real = 0
for (const f of files) {
  const t = fs.readFileSync(base + f, 'utf8')
  const total = (t.match(/type="submit"/g) || []).length
  const realHits = (t.match(/(?<!form-)type="submit"/g) || []).length
  console.log(`${f}: total=${total} real=${realHits}`)
  real += realHits
}
console.log('REAL total:', real)
