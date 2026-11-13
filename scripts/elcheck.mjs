import fs from 'node:fs'
import path from 'node:path'
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.vue$/.test(e.name) ? [path.join(d, e.name)] : []))
const hits = []
for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const m = t.match(/class="[^"]*\bel-[a-z][a-z-]*[" ]/g)
  if (m) hits.push(path.basename(f) + ': ' + JSON.stringify([...new Set(m)]))
}
console.log(hits.join('\n') || 'NONE')
