/**
 * 从 lucide-static 提取所需图标 → 子集化 TTF → 生成码表 JSON。
 * 运行：node scripts/build-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 与源码中 import { ... } from 'lucide-vue-next' 的名字一一对应
const ICON_NAMES = [
  'AlertCircle','ArrowDown','ArrowLeft','ArrowRight','ArrowRightLeft','ArrowUp','ArrowUpRight',
  'BookHeart','BookOpen','CalendarDays','Check','CheckCheck','CheckCircle2','ChefHat',
  'ChevronDown','ChevronLeft','ChevronRight','CircleHelp','Clock3','CookingPot','Copy',
  'Eye','EyeOff','Github','Heart','House','KeyRound','Leaf','Link','ListChecks','LoaderCircle',
  'LockKeyhole','LogOut','MessageCircle','Minus','Pencil','Plus','RefreshCw','RotateCcw',
  'Search','Settings2','ShieldCheck','ShoppingBasket','SlidersHorizontal','Sparkles','Sprout',
  'TextCursorInput','Trash2','UserRound','Users','Utensils','X',
]

function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1-$2')
}

const codepoints = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/lucide-static/font/codepoints.json'), 'utf8')
)

const codes = {}
const missing = []
for (const name of ICON_NAMES) {
  const key = pascalToKebab(name)
  const cp = codepoints[key]
  if (cp === undefined) {
    missing.push(`${name} → ${key}`)
    continue
  }
  codes[name] = String.fromCodePoint(cp)
}
if (missing.length) {
  console.error('缺少图标：\n' + missing.join('\n'))
  process.exit(1)
}

const text = Object.values(codes).join('')
const ttfPath = path.join(root, 'node_modules/lucide-static/font/lucide.ttf')
const source = fs.readFileSync(ttfPath)
const subset = await subsetFont(source, text, { targetFormat: 'truetype' })

const outDir = path.join(root, 'src/static')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'yican-icons.ttf'), subset)
fs.writeFileSync(path.join(root, 'src/icon-codes.json'), JSON.stringify(codes, null, 2))

console.log(`图标字体：${(subset.length / 1024).toFixed(1)} KB，${Object.keys(codes).length} 个图标`)
