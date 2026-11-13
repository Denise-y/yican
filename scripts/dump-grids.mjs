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

let n = 0
for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.basename(f)
  const re = /([^{}]+)\{([^}]*display:\s*grid[^}]*)\}/g
  let m
  while ((m = re.exec(t))) {
    n++
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ')
    const body = m[2].replace(/\s+/g, ' ').trim()
    // extract grid-specific props
    const props = body
      .split(';')
      .map((s) => s.trim())
      .filter((s) => /grid|place-items|justify-items|align-items|display/.test(s))
      .join('; ')
    console.log(`${String(n).padStart(2)}. [${rel}] ${sel.slice(0, 80)}`)
    console.log(`      ${props.slice(0, 220)}`)
  }
}
console.log(`\nTOTAL: ${n}`)
