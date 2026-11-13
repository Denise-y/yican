import fs from 'node:fs'
import path from 'node:path'

const roots = ['D:/yican-miniprogram/server', 'D:/yican-miniprogram/src']
const seen = new Set()
const externals = new Set()
const queue = ['D:/yican-miniprogram/server/index.ts']

while (queue.length) {
  const f = queue.pop()
  if (seen.has(f) || !fs.existsSync(f)) continue
  seen.add(f)
  const dir = path.dirname(f)
  const t = fs.readFileSync(f, 'utf8')
  const re = /from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(t))) {
    const spec = m[1]
    if (spec.startsWith('.')) {
      const base = path.resolve(dir, spec)
      for (const ext of ['', '.ts', '.vue', '/index.ts']) {
        const cand = base + ext
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          queue.push(cand)
          break
        }
      }
    } else {
      externals.add(spec.split('/').slice(0, spec.startsWith('@') ? 2 : 1).join('/'))
    }
  }
}
console.log('--- local files (' + seen.size + ') ---')
console.log([...seen].map((f) => path.relative('D:/yican-miniprogram', f)).join('\n'))
console.log('--- externals ---')
console.log([...externals].filter((e) => !e.startsWith('node:')).join('\n'))
