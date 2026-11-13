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

let issues = 0
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.relative(dist, f)
  const checks = [
    ['STAR', /(^|[},])\s*\*/],
    ['NOT', /:not\(/],
    ['PSEUDO+SIBLING', /:[a-z-]+(\([^)]*\))?\s*[+~]\s*[.a-z\[]/],
    ['CHECK-INPUT', /check-wrap\s+input/],
    ['BG-LOCAL-URL', /background[^;}]*url\(\s*['"]?(?!data:|https?:|#)/],
    ['ATTR-EQ', /\[[a-z-]+[~^$*]?=/],
  ]
  for (const [name, re] of checks) {
    const m = t.match(re)
    if (m) {
      const idx = t.search(re)
      issues++
      console.log(`${rel} [${name}] ...${JSON.stringify(t.slice(Math.max(0, idx - 50), idx + 90))}...`)
    }
  }
}
console.log(`\nchecked ${files.length} wxss files, ${issues} issue(s)`)
