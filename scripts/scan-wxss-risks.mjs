import fs from 'node:fs'
import path from 'node:path'

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    const s = fs.statSync(p)
    if (s.isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist') walk(p, out)
    } else if (/\.(css|vue)$/.test(f)) out.push(p)
  }
  return out
}

const files = walk('D:/yican-miniprogram/src')
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.relative('D:/yican-miniprogram', f)

  const nots = []
  const re1 = /:not\([^)]*\)/g
  let m
  while ((m = re1.exec(t))) nots.push(t.slice(Math.max(0, m.index - 50), m.index + m[0].length + 25).replace(/\s+/g, ' '))
  if (nots.length) {
    console.log(`[${rel} :not x${nots.length}]`)
    nots.slice(0, 8).forEach((s) => console.log('   ' + JSON.stringify(s)))
  }

  const re2 = /background[^;}]*url\(\s*['"]?(?!data:|https?:|#)[^)]+\)/g
  const bgs = t.match(re2)
  if (bgs) console.log(`[${rel} BG-LOCAL x${bgs.length}] ` + bgs.slice(0, 3).join(' || '))

  const re3 = /([^{}]+)\{[^}]*\}/g
  const tildes = []
  let mm
  while ((mm = re3.exec(t))) {
    const sel = mm[1].trim()
    if (/\S\s*~\s*\S/.test(sel)) tildes.push(sel)
  }
  if (tildes.length) console.log(`[${rel} TILDE x${tildes.length}] ` + tildes.slice(0, 4).join(' | '))
}
console.log('scan done')
