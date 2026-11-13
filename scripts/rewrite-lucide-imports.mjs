// Rewrite `import { A, B } from 'lucide-vue-next'` into default imports of
// the generated .vue wrappers (uni only registers .vue imports in usingComponents).
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const files = [
  'src/AccountRoot.vue',
  'src/MainView.vue',
  'src/components/AccountSettings.vue',
  'src/components/AuthScreen.vue',
  'src/components/FeedbackGateway.vue',
  'src/components/InviteLanding.vue',
  'src/components/KitchenManagement.vue',
  'src/components/KitchenNameEditor.vue',
  'src/components/MealJournal.vue',
  'src/components/Modal.vue',
  'src/components/RecipeEditor.vue',
  'src/components/ReviewCenter.vue',
  'src/components/StockTextEntry.vue',
  'src/components/ThemePicker.vue',
]

const re = /import\s*\{([^}]+)\}\s*from\s*'lucide-vue-next'/g

for (const rel of files) {
  const abs = path.join(root, rel)
  let src = fs.readFileSync(abs, 'utf8')
  const dir = path.dirname(rel)
  let count = 0
  src = src.replace(re, (_m, inner) => {
    const names = inner
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    count += names.length
    const prefix = dir === 'src' ? './components/icons/' : './icons/'
    return names.map((n) => `import ${n} from '${prefix}${n}.vue'`).join('\n')
  })
  if (count === 0) {
    console.log(`SKIP ${rel} (no matches)`)
    continue
  }
  fs.writeFileSync(abs, src, 'utf8')
  console.log(`OK   ${rel} (${count} icons)`)
}

// Verify zero remaining references
let leftover = 0
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(vue|ts|mts|js)$/.test(e.name)) {
      const t = fs.readFileSync(p, 'utf8')
      if (t.includes("from 'lucide-vue-next'") || t.includes('from "lucide-vue-next"')) {
        console.log('LEFTOVER', p)
        leftover++
      }
    }
  }
}
walk(path.join(root, 'src'))
console.log(leftover === 0 ? 'no leftover lucide-vue-next imports' : `${leftover} leftover file(s)`)
