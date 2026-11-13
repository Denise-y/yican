import fs from 'node:fs'

const dist = 'D:/yican-miniprogram/dist/build/mp-weixin'

function childrenOf(file, cls) {
  const t = fs.readFileSync(file, 'utf8')
  const idx = t.indexOf('"' + cls + ' ')
  const idx2 = idx >= 0 ? idx : t.indexOf('"' + cls + '"')
  if (idx2 < 0) return console.log(`${cls}: NF`)
  const s = t.lastIndexOf('<', idx2)
  const st = />/.exec(t.slice(s))
  const innerStart = s + st.index + 1
  const elemRe = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
  elemRe.lastIndex = innerStart
  let depth = 1
  let innerEnd = t.length
  let m
  while ((m = elemRe.exec(t))) {
    const full = t.slice(m.index, elemRe.lastIndex)
    if (m[1]) {
      depth--
      if (depth === 0) {
        innerEnd = elemRe.index ?? elemRe.lastIndex - full.length
        innerEnd = m.index
        break
      }
    } else if (!full.endsWith('/>')) depth++
  }
  const inner = t.slice(innerStart, innerEnd)
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
      const cm = k[3].match(/class="([^"]*)"/)
      const names = cm
        ? '.' + cm[1].replace(/\{\{[^}]*\}\}/g, ' ').split(/\s+/).filter((c) => c && !c.startsWith('data-v')).join('.')
        : ''
      kids.push(k[2] + names)
    }
    if (!kf.endsWith('/>')) kd++
  }
  console.log(`${cls}: ${kids.join(' | ').slice(0, 220)}`)
}

childrenOf(dist + '/MainView.wxml', 'menu-layout')
childrenOf(dist + '/components/MealJournal.wxml', 'journal-layout')
childrenOf(dist + '/components/MealJournal.wxml', 'journal-days')
childrenOf(dist + '/components/RecipeEditor.wxml', 'editor-covers')
childrenOf(dist + '/MainView.wxml', 'chef-layout')
childrenOf(dist + '/components/ReviewCenter.wxml', 'review-targets')

// gaps from source
const srcs = ['account.css', 'journal.css', 'style.css', 'reviews.css', 'mobile-warm.css', 'components/RecipeEditor.vue', 'components/KitchenManagement.vue', 'components/KitchenNameEditor.vue', 'components/StockTextEntry.vue', 'MainView.vue']
const sels = ['auth-tabs', 'auth-roles', 'management-actions', 'kitchen-name-actions', 'editor-covers', 'ingredient-amounts', 'stock-text-actions', 'stock-text-row-fields', 'stock-entry-actions', 'journal-stats', 'journal-days', 'journal-layout', 'form-grid', 'settings-grid', 'inventory-grid', 'invite-type', 'recipe-modal', 'menu-layout', 'chef-layout', 'review-targets', 'menu-browser', 'shopping-row', 'feedback-gateway-actions']
for (const f of srcs) {
  let t
  try {
    t = fs.readFileSync('D:/yican-miniprogram/src/' + f, 'utf8')
  } catch {
    continue
  }
  for (const s of sels) {
    const re = new RegExp('\\.' + s + '(?![a-z-])[^{}]*\\{[^{}]*\\}', 'g')
    let m
    while ((m = re.exec(t))) {
      if (/display|gap|grid/.test(m[0])) console.log(`[${f}] ${m[0].replace(/\s+/g, ' ').slice(0, 200)}`)
    }
  }
}
