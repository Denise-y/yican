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

for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.basename(f)
  const re = /([^{}]+)\{[^}]*\}/g
  let m
  while ((m = re.exec(t))) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (!sel || sel.startsWith('@')) continue
    if (!/\+/.test(sel)) continue
    // split group selectors
    for (const one of sel.split(',')) {
      const s = one.trim()
      if (/\+/.test(s)) console.log(`${rel} :: ${JSON.stringify(s)}`)
    }
  }
}
