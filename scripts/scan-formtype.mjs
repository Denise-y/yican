import fs from 'node:fs'
import path from 'node:path'

const root = 'D:/yican-miniprogram/node_modules/@dcloudio'
const out = []

function walk(d, depth) {
  if (depth > 7) return
  let es
  try { es = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
  for (const e of es) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { walk(p, depth + 1); continue }
    if (!/\.(js|mjs|cjs)$/.test(e.name)) continue
    if (!/mp|uni-app|vite-plugin/.test(p)) continue
    try {
      const t = fs.readFileSync(p, 'utf8')
      // look for logic turning button type=submit into formType
      const re = /['"]submit['"]\s*===?\s*[\w.()]+type|type\s*===?\s*['"]submit['"]|case\s*['"]submit['"]/g
      let m
      while ((m = re.exec(t))) {
        const ctx = t.slice(Math.max(0, m.index - 150), m.index + 200).replace(/\n/g, ' ')
        if (/form/i.test(ctx)) {
          out.push(path.relative(root, p) + '\n  ...' + ctx.slice(0, 330))
        }
      }
    } catch {}
  }
}

walk(root, 0)
console.log(out.slice(0, 12).join('\n\n') || 'NO MATCH')
