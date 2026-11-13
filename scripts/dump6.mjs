import fs from 'node:fs'
const files = ['style.css', 'mobile-warm.css', 'account.css', 'journal.css', 'reviews.css']
const sels = ['.auth-form-side', '.auth-story', '.auth-page', '.recipe-visual', '.prep-card', '.menu-main', '.category-rail', '.menu-results', '.journal-calendar', '.journal-day-detail', '.settings-card', '.stock-card', '.form-field', '.dish-card', '.chef-main', '.auth-mobile-brand', '.mobile-recipe-nav', '.ingredient-mid']
for (const f of files) {
  const t = fs.readFileSync('D:/yican-miniprogram/src/' + f, 'utf8')
  for (const s of sels) {
    const re = new RegExp('(^|[\\s,{}])(' + s.replace('.', '\\.') + ')(?![a-z-])[^{}]*\\{[^{}]*\\}', 'g')
    let m
    while ((m = re.exec(t))) {
      console.log(`[${f}] ${m[0].replace(/\s+/g, ' ').slice(0, 260)}`)
    }
  }
}
// vue styles
for (const f of ['MainView.vue', 'components/RecipeEditor.vue']) {
  const t = fs.readFileSync('D:/yican-miniprogram/src/' + f, 'utf8')
  for (const s of ['.stock-card', '.form-field', '.mobile-recipe-nav']) {
    const re = new RegExp('(' + s.replace('.', '\\.') + ')(?![a-z-])[^{}]*\\{[^{}]*\\}', 'g')
    let m
    while ((m = re.exec(t))) console.log(`[${f}] ${m[0].replace(/\s+/g, ' ').slice(0, 220)}`)
  }
}
// place-items outside display:grid rules
console.log('\n== place-items not co-located with display:grid ==')
const all = [...files, 'form-controls.css', 'components/FeedbackGateway.vue', 'components/KitchenManagement.vue', 'components/KitchenNameEditor.vue', 'components/StockTextEntry.vue', 'components/MealJournal.vue', 'components/ReviewCenter.vue', 'components/AccountSettings.vue', 'components/ThemePicker.vue', 'components/AuthScreen.vue']
for (const f of all) {
  let t
  try { t = fs.readFileSync('D:/yican-miniprogram/src/' + f, 'utf8') } catch { continue }
  let i = 0
  while ((i = t.indexOf('place-items', i)) >= 0) {
    const s = t.lastIndexOf('{', i)
    const sel = t.slice(t.lastIndexOf('}', s) + 1, s).replace(/\s+/g, ' ').trim().slice(-120)
    const body = t.slice(s + 1, t.indexOf('}', i))
    if (!/display\s*:\s*(inline-)?grid/.test(body)) console.log(`[${f}] SEL: ${sel} BODY: ${body.replace(/\s+/g, ' ').slice(0, 160)}`)
    i += 11
  }
}
