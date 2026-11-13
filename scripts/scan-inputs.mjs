import fs from 'node:fs'
import path from 'node:path'

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(vue|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

const files = walk('D:/yican-miniprogram/src').filter((f) => !f.includes('pages\\tmp'))

console.log('=== problem input types ===')
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const re = /<input[^>]*type=["'](date|time|checkbox|radio|file|range)["'][^>]*>/g
  let m
  while ((m = re.exec(t))) {
    const line = t.slice(0, m.index).split(/\r?\n/).length
    console.log(path.basename(f) + ':' + line + ': ' + m[0].slice(0, 200))
  }
}

console.log('\n=== native-check / checkbox labels ===')
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const re = /native-check[\s\S]{0,200}/g
  let m
  while ((m = re.exec(t))) {
    const line = t.slice(0, m.index).split(/\r?\n/).length
    console.log(path.basename(f) + ':' + line + ': ' + m[0].replace(/\n/g, ' ').slice(0, 180))
  }
}
