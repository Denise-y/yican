import fs from 'node:fs'

// parse wxml (minified) — find element with class containing target, walk to matching close, list direct child tags/classes
const targets = [
  'auth-tabs', 'auth-roles', 'management-actions', 'kitchen-name-actions',
  'editor-covers', 'ingredient-amounts', 'stock-text-row-fields', 'stock-text-actions',
  'journal-stats', 'journal-days', 'review-targets', 'menu-layout', 'menu-browser',
  'dish-grid', 'inventory-grid', 'settings-grid', 'chef-layout', 'recipe-modal',
  'invite-type', 'form-grid', 'shopping-row', 'stock-entry-actions', 'calendar-week',
  'calendar-grid', 'mobile-recipe-nav', 'feedback-gateway-actions', 'account-summary',
]

function harvest(file) {
  const t = fs.readFileSync(file, 'utf8')
  const out = {}
  for (const cls of targets) {
    // find a tag whose class attr contains the target as a whole token
    const re = new RegExp('<(view|label|button|text|form|scroll-view)\\b[^>]*class="[^"]*(^|\\s|")' + cls + '(\\s|")([^"]*)"[^>]*>', 'g')
    // simpler: class attr contains ` cls ` or cls at edges — use loose then verify token
    let m
    const tagRe = new RegExp('<([a-z-]+)\\b([^>]*)>', 'g')
    let start = -1
    let startTag = null
    const stack = []
    // crude scan
    const elemRe = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
    let e
    const parents = []
    while ((e = elemRe.exec(t))) {
      const closing = !!e[1]
      const tag = e[2]
      const attrs = e[3] || ''
      if (!closing) {
        const cm = attrs.match(/class="([^"]*)"/)
        const classes = cm ? cm[1].split(/\s+/) : []
        if (classes.includes(cls) && !out[cls]) {
          out[cls] = { tag, children: [], depth: 1, selfAttrs: attrs.slice(0, 150) }
          out[cls]._start = e.index
          out[cls]._elEnd = elemRe.lastIndex
          // find matching close with depth counting
          let depth = 1
          const innerRe = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
          innerRe.lastIndex = elemRe.lastIndex
          let ie
          while ((ie = innerRe.exec(t))) {
            if (ie[1]) {
              depth--
              if (depth === 0) {
                out[cls]._inner = t.slice(out[cls]._elEnd, ie.index)
                break
              }
            } else {
              // self-closing like <input ... > not counted if starts with / — wxslf-closing tags end with />
              const full = t.slice(ie.index, innerRe.lastIndex)
              if (!full.endsWith('/>')) depth++
            }
          }
        }
      }
    }
  }
  return out
}

const res = harvest('D:/yican-miniprogram/dist/build/mp-weixin/MainView.wxml')
for (const cls of targets) {
  const r = res[cls]
  if (!r || r._inner === undefined) {
    console.log(`${cls}: NOT FOUND or unclosed`)
    continue
  }
  // direct children: scan inner with depth
  const kids = []
  const re = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
  let depth = 0
  let m
  while ((m = re.exec(r._inner))) {
    const full = r._inner.slice(m.index, re.lastIndex)
    if (m[1]) {
      depth--
      continue
    }
    if (depth === 0) {
      const cm = m[3].match(/class="([^"]*)"/)
      kids.push(`${m[2]}${cm ? '.' + cm[1].split(/\s+/).filter((c) => !c.startsWith('data-v')).join('.') : ''}`)
    }
    if (!full.endsWith('/>')) depth++
  }
  console.log(`${cls} <${r.tag}>: ${kids.join('  |  ').slice(0, 240)}`)
}
