import fs from 'node:fs'
import path from 'node:path'
const root = 'D:/yican-miniprogram/dist/build/mp-weixin'
function walk(d, acc = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}
const files = walk(root)
const bad = []
const PATTERNS = [
  [/display:\s*(inline-)?grid/, 'display:grid'],
  [/grid-template/, 'grid-template*'],
  [/place-items/, 'place-items'],
  [/place-content/, 'place-content'],
  [/justify-items/, 'justify-items'],
]
for (const f of files) {
  const rel = path.relative(root, f)
  if (/\.(wxss|json)$/.test(f)) {
    const t = fs.readFileSync(f, 'utf8')
    for (const [re, name] of PATTERNS) {
      if (re.test(t)) bad.push(`${rel}: ${name}`)
    }
    const tags = t.match(/(^|[},\s])(span|div|p|main|header|footer|section|article|nav|aside|h[1-6]|b|strong|em|i|small|ul|li|fieldset|a|img|select)(\s*[,{])/g)
    if (tags) bad.push(`${rel}: tag-selectors ${JSON.stringify(tags.slice(0, 6))}`)
  }
}
const checks = []
const allwxss = files.filter((f) => f.endsWith('.wxss')).map((f) => fs.readFileSync(f, 'utf8')).join('\n')
const auth = (allwxss.match(/\.auth-tabs[^{]*\{[^}]*\}/g) || [])
checks.push(['auth-tabs rules', auth.length])
checks.push(['auth-tabs display:flex', auth.some((r) => /display:\s*flex/.test(r))])
checks.push(['auth-tabs child flex-basis', /\.auth-tabs>\s*button[^{]*\{[^}]*flex:\s*1/.test(allwxss)])
checks.push(['status-bar padding present', /--status-bar-height/.test(allwxss)])
checks.push(['shopping-row display:flex', /\.shopping-row[^{]*\{[^}]*display:\s*flex/.test(allwxss)])
checks.push(['ingredient-mid rule', /\.ingredient-mid\{/.test(allwxss)])
const allwxml = files.filter((f) => f.endsWith('.wxml')).map((f) => fs.readFileSync(f, 'utf8')).join('')
checks.push(['ingredient-mid in wxml', allwxml.includes('ingredient-mid')])
checks.push(['chef-main in wxml', allwxml.includes('chef-main')])
checks.push(['el-span in wxml', (allwxml.match(/el-span/g) || []).length])
checks.push(['naked <div>', (allwxml.match(/<div[\s>]/g) || []).length])
checks.push(['naked <span>', (allwxml.match(/<span[\s>]/g) || []).length])
checks.push(['naked <main>', (allwxml.match(/<main[\s>]/g) || []).length])
checks.push(['naked <p>', (allwxml.match(/<p[\s>]/g) || []).length])
console.log('BAD:', bad.length ? '\n  ' + bad.join('\n  ') : 'NONE')
for (const [k, v] of checks) console.log(' ', k, '=', v)
if (bad.length) process.exitCode = 1
