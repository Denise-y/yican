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

console.log('=== rules with grid-* props but NO display:grid (media overrides etc) ===')
for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.basename(f)
  const re = /([^{}]+)\{([^}]*)\}/g
  let m
  while ((m = re.exec(t))) {
    const body = m[2]
    if (/grid-template|grid-auto|grid-gap|grid-area|grid-row|grid-column|place-items|justify-items|place-content/.test(body) && !/display:\s*grid/.test(body)) {
      console.log(`[${rel}] ${m[1].trim().replace(/\s+/g, ' ').slice(0, 100)}`)
      console.log(`     ${body.replace(/\s+/g, ' ').trim().slice(0, 200)}`)
    }
  }
}

console.log('\n=== media queries containing grid anywhere ===')
for (const f of walk('D:/yican-miniprogram/src')) {
  const t = fs.readFileSync(f, 'utf8')
  const rel = path.basename(f)
  const re = /@media[^{]*\{/g
  let m
  while ((m = re.exec(t))) {
    // find matching close brace block
    let depth = 1
    let i = re.lastIndex
    while (i < t.length && depth > 0) {
      if (t[i] === '{') depth++
      else if (t[i] === '}') depth--
      i++
    }
    const block = t.slice(m.index, i)
    if (/grid/.test(block)) {
      console.log(`[${rel}] ${block.replace(/\s+/g, ' ').slice(0, 300)}`)
    }
  }
}
