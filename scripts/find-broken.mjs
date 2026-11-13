import fs from 'node:fs'
import path from 'node:path'
function walk(d, acc = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (/\.vue$/.test(f)) acc.push(p)
  }
  return acc
}
const patterns = [/\/\s+class="el-/g, /\/ class="el-/g, />\s*class="el-[a-z0-9-]+"[^>]*\s+\/>/g]
for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const m = t.match(/\/ class="el-[a-z0-9-]+"/g)
  if (m) console.log(f, '=>', m.join(' '))
}
