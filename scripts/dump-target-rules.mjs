import fs from 'node:fs'

const files = ['account.css', 'journal.css', 'mobile-warm.css', 'reviews.css', 'style.css', 'themes.css']
const targets = [
  '.auth-page', '.auth-tabs', '.auth-roles', '.account-summary>span:first-child',
  '.management-actions', '.kitchen-name-actions', '.editor-covers', '.ingredient-amounts',
  '.stock-text-welcome>span', '.stock-text-row-fields', '.stock-text-actions',
  '.journal-layout', '.journal-stats', '.journal-days',
  '.menu-browser', '.calendar-week', '.calendar-grid', '.mobile-recipe-nav',
  '.review-targets', '.menu-layout', '.dish-grid', '.inventory-grid',
  '.settings-grid', '.chef-layout', '.recipe-modal', '.invite-type',
  '.form-grid', '.shopping-row', '.stock-entry-actions',
  '.ingredient-name', '.ingredient-amount', '.ingredient-status', '.check-wrap',
  '.prep-icon', '.auth-toggle-check', '.auth-password-field>button',
  '.account-summary>span:first-child', '.small-avatars>span', '.journal-empty>span',
  '.feedback-gateway-actions', '.auth-plate', '.theme-check', '.auth-brand-symbol',
]

function rulesFor(t, sel) {
  const out = []
  const re = new RegExp('([^{}]*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^{}]*)\\{([^}]*)\\}', 'g')
  let m
  while ((m = re.exec(t))) out.push({ sel: m[1].trim().replace(/\s+/g, ' '), body: m[2].replace(/\s+/g, ' ').trim() })
  return out
}

for (const f of files) {
  const t = fs.readFileSync('D:/yican-miniprogram/src/' + f, 'utf8')
  // also pull media blocks
  const blocks = []
  const mre = /@media[^{]*\{/g
  let m
  while ((m = mre.exec(t))) {
    let depth = 1
    let i = mre.lastIndex
    while (i < t.length && depth > 0) {
      if (t[i] === '{') depth++
      else if (t[i] === '}') depth--
      i++
    }
    blocks.push(t.slice(m.index, i))
  }
  for (const sel of targets) {
    const rs = rulesFor(t, sel)
    for (const r of rs) {
      if (/grid|place-items/.test(r.body + r.sel)) console.log(`[${f}] ${r.sel} { ${r.body} }`)
    }
    for (const b of blocks) {
      if (/grid/.test(b) && b.includes(sel.replace(/>\w+/g, (s) => s))) {
        const inner = rulesFor(b, sel)
        for (const r of inner) console.log(`[${f}] @MEDIA ${r.sel} { ${r.body} }`)
      }
    }
  }
}
