import fs from 'node:fs'
import path from 'node:path'

const targets = [
  'auth-tabs', 'auth-roles', 'management-actions', 'kitchen-name-actions',
  'editor-covers', 'ingredient-amounts', 'stock-text-row-fields', 'stock-text-actions',
  'journal-stats', 'journal-days', 'review-targets', 'shopping-row',
  'feedback-gateway-actions', 'account-summary', 'auth-roles',
]

function walk(d, o = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + f.name
    if (f.isDirectory()) walk(p, o)
    else if (f.name.endsWith('.wxml')) o.push(p)
  }
  return o
}

for (const file of walk('D:/yican-miniprogram/dist/build/mp-weixin')) {
  const t = fs.readFileSync(file, 'utf8')
  for (const cls of targets) {
    // find element whose class list contains cls as token (static part)
    const elRe = /<([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
    let m
    while ((m = elRe.exec(t))) {
      const cm = m[2].match(/class="([^"]*)"/)
      if (!cm) continue
      const staticClasses = cm[1].replace(/\{\{[^}]*\}\}/g, ' ').split(/\s+/).filter(Boolean)
      if (!staticClasses.includes(cls)) continue
      // element inner
      const afterStart = elRe.lastIndex
      const elemRe2 = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
      elemRe2.lastIndex = afterStart
      let depth = 1
      let innerEnd = t.length
      let ie
      while ((ie = elemRe2.exec(t))) {
        const full = t.slice(ie.index, elemRe2.lastIndex)
        if (ie[1]) {
          depth--
          if (depth === 0) {
            innerEnd = ie.index
            break
          }
        } else if (!full.endsWith('/>')) depth++
      }
      const inner = t.slice(afterStart, innerEnd)
      const kids = []
      const kre = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
      let kd = 0
      let k
      while ((k = kre.exec(inner))) {
        const kf = inner.slice(k.index, kre.lastIndex)
        if (k[1]) {
          kd--
          continue
        }
        if (kd === 0) {
          const km = k[3].match(/class="([^"]*)"/)
          let names = ''
          if (km) {
            names =
              '.' +
              km[1]
                .replace(/\{\{[^}]*\}\}/g, ' ')
                .split(/\s+/)
                .filter((c) => c && !c.startsWith('data-v'))
                .join('.')
          }
          kids.push(k[2] + names)
        }
        if (!kf.endsWith('/>')) kd++
      }
      console.log(`${path.basename(file)} :: ${cls} <${m[1]}>: ${kids.join(' | ').slice(0, 220)}`)
      break
    }
  }
}
