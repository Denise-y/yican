import fs from 'node:fs'
import path from 'node:path'

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.wxml')) out.push(p)
  }
  return out
}

const bad = ['<select', 'type="submit"', 'type="checkbox"', 'type="date"', 'type="time"', '<option', '<datalist', ' form="']
let issues = 0
for (const f of walk('D:/yican-miniprogram/dist/build/mp-weixin')) {
  const t = fs.readFileSync(f, 'utf8')
  const hits = bad.filter((b) => t.includes(b))
  if (hits.length) {
    issues++
    console.log(path.relative('D:/yican-miniprogram/dist/build/mp-weixin', f) + ': ' + hits.join(', '))
  }
}
console.log(issues ? issues + ' files with leftovers' : 'ALL CLEAN')
