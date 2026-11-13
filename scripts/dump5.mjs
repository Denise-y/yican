import fs from 'node:fs'
const files = {
  main: 'D:/yican-miniprogram/src/MainView.vue',
  recipe: 'D:/yican-miniprogram/src/components/RecipeModal.vue',
}
const sels = ['recipe-modal', 'settings-grid', 'inventory-grid', 'form-grid', 'calendar-grid', 'calendar-week', 'mobile-recipe-nav', 'menu-main', 'shopping-row', 'journal-stats']
for (const [name, p] of Object.entries(files)) {
  let t
  try { t = fs.readFileSync(p, 'utf8') } catch { continue }
  for (const s of sels) {
    const re = new RegExp('class="' + s + '"', 'g')
    let m
    while ((m = re.exec(t))) {
      console.log(`[${name}] .${s} :: ${t.slice(Math.max(0, m.index - 40), m.index + 400).replace(/\s+/g, ' ').slice(0, 430)}`)
      console.log('---')
    }
  }
}
// where is recipe-modal defined?
const dir = 'D:/yican-miniprogram/src/components'
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.vue')) continue
  const t = fs.readFileSync(dir + '/' + f, 'utf8')
  if (t.includes('recipe-modal')) console.log('recipe-modal in', f)
  if (t.includes('mobile-recipe-nav')) console.log('mobile-recipe-nav in', f)
}
