import fs from 'node:fs'
import path from 'node:path'

const dist = 'D:/yican-miniprogram/dist/build/mp-weixin'
const files = []
;(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + f.name
    if (f.isDirectory()) walk(p)
    else if (f.name.endsWith('.wxss')) files.push(p)
  }
})(dist)

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.relative(dist, f)
  // strip comments first
  const s = t.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
  let n = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*') {
      n++
      console.log(`${rel}@${i} prev=${JSON.stringify(s.slice(Math.max(0, i - 45), i))} next=${JSON.stringify(s.slice(i, i + 45))}`)
    }
  }
  if (!n) console.log(`${rel}: no *`)
}
