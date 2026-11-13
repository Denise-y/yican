import fs from 'node:fs'

const targets = [
  ['D:/yican-miniprogram/src/style.css', [':not(', '*{box-sizing']],
  ['D:/yican-miniprogram/src/account.css', [':not(']],
  ['D:/yican-miniprogram/src/mobile-warm.css', [':not(']],
  ['D:/yican-miniprogram/src/themes.css', [':not(']],
]

function rulesContaining(t, needle) {
  const out = []
  let i = 0
  while (i < t.length) {
    const n = t.indexOf(needle, i)
    if (n < 0) break
    const open = t.lastIndexOf('{', n)
    let start = open
    // selector = text before {, walk back to previous } or start
    const prevClose = t.lastIndexOf('}', open)
    start = prevClose + 1
    const close = t.indexOf('}', n)
    out.push(t.slice(start, close + 1).replace(/\s+/g, ' ').trim())
    i = close + 1
  }
  return out
}

for (const [file, needles] of targets) {
  const t = fs.readFileSync(file, 'utf8')
  console.log('==== ' + file)
  for (const nd of needles) {
    for (const r of rulesContaining(t, nd)) console.log('  RULE: ' + r)
  }
}

// custom component tags from dist usingComponents
const dist = 'D:/yican-miniprogram/dist/build/mp-weixin'
const tags = new Set()
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + f.name
    if (f.isDirectory()) walk(p)
    else if (f.name.endsWith('.json')) {
      try {
        const j = JSON.parse(fs.readFileSync(p, 'utf8'))
        if (j.usingComponents) for (const k of Object.keys(j.usingComponents)) tags.add(k)
      } catch {}
    }
  }
}
walk(dist)
console.log('==== custom tags:', [...tags].join(','))
