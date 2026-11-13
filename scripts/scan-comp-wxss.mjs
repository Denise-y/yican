import fs from 'node:fs'
import path from 'node:path'

const dist = 'D:/yican-miniprogram/dist/build/mp-weixin'
const spots = [
  ['components/StockTextEntry.wxss', 3724],
  ['components/RecipeEditor.wxss', 2723],
  ['components/KitchenManagement.wxss', 1877],
  ['components/FeedbackGateway.wxss', 488],
]

function selectorAt(t, pos) {
  const open = t.lastIndexOf('{', pos)
  const prev = Math.max(t.lastIndexOf('}', open), t.lastIndexOf(';', open))
  return t.slice(prev + 1, open).trim()
}

for (const [rel, pos] of spots) {
  const t = fs.readFileSync(path.join(dist, rel), 'utf8')
  console.log(`${rel}@${pos}`)
  console.log(`  selector: ${JSON.stringify(selectorAt(t, pos))}`)
  console.log(`  ctx: ${JSON.stringify(t.slice(Math.max(0, pos - 60), pos + 60))}`)
}

// global: find ALL id/attr/tag selectors inside each component wxss
console.log('\n=== component wxss risky selectors ===')
const compDir = path.join(dist, 'components')
for (const f of fs.readdirSync(compDir)) {
  if (!f.endsWith('.wxss')) continue
  const t = fs.readFileSync(path.join(compDir, f), 'utf8')
  const sels = []
  const re = /([^{}]+)\{/g
  let m
  while ((m = re.exec(t))) {
    const sel = m[1].trim()
    if (!sel || sel.startsWith('@') || sel.startsWith('/*')) continue
    for (const one of sel.split(',')) {
      const o = one.trim()
      if (/#[a-z]/i.test(o) || /\[/.test(o) || /(^|,)\s*(view|text|button|input|label|form|picker|textarea|image|scroll-view|swiper|checkbox|radio|switch)\b/.test(o)) {
        sels.push(o.slice(0, 90))
      }
    }
  }
  if (sels.length) {
    console.log(`\n[${f}] ${sels.length} risky:`)
    ;[...new Set(sels)].slice(0, 25).forEach((s) => console.log('   ' + s))
  }
}
