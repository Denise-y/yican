import fs from 'node:fs'
import path from 'node:path'

const TAGS = new Set(['br', 'hr', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'abbr', 'address', 'b', 'bdi', 'bdo', 'blockquote', 'cite', 'code', 'del', 'ins', 'dfn', 'em', 'strong', 'samp', 'kbd', 'var', 'i', 'mark', 'pre', 'q', 'ruby', 'rp', 'rt', 's', 'small', 'sub', 'sup', 'time', 'u', 'wbr', 'select', 'option', 'optgroup', 'fieldset', 'datalist', 'legend', 'output', 'iframe', 'img', 'figure', 'figcaption', 'source', 'track', 'a', 'nav', 'link', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu', 'command', 'table', 'caption', 'th', 'td', 'tr', 'thead', 'tbody', 'tfoot', 'col', 'colgroup', 'div', 'main', 'span', 'header', 'footer', 'section', 'article', 'aside', 'details', 'dialog', 'summary', 'meter', 'head', 'meta', 'base', 'area', 'script', 'noscript', 'embed', 'object', 'param'])

const SRC = 'D:/yican-miniprogram/src'
const stats = {}
const addedAfter = []

function bump(k) { stats[k] = (stats[k] || 0) + 1 }

function rewriteTags(p) {
  let out = ''
  let i = 0
  const n = p.length
  while (i < n) {
    const ch = p[i]
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < n && p[j] !== ch) { if (p[j] === '\\') j++; j++ }
      out += p.slice(i, j + 1)
      i = j + 1
      continue
    }
    if (/[a-zA-Z_-]/.test(ch)) {
      let j = i
      while (j < n && /[a-zA-Z0-9_-]/.test(p[j])) j++
      const ident = p.slice(i, j)
      let q = i - 1
      while (q >= 0 && /\s/.test(p[q])) q--
      const prev = q >= 0 ? p[q] : ''
      const next = j < n ? p[j] : ''
      const prevOk = prev === '' || prev === ',' || prev === '>' || prev === '+' || prev === '~' || prev === ']' || prev === ')' || /[a-zA-Z0-9_)-]/.test(prev)
      if (TAGS.has(ident) && prevOk && next !== '(') {
        out += '.el-' + ident
      } else {
        out += ident
      }
      i = j
      continue
    }
    out += ch
    i++
  }
  return out
}

const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*;\s*}/g, ';').replace(/;\s*$/, '').replace(/^\s*;\s*/, '').replace(/\s*{\s*/g, '{').replace(/\s*}\s*/g, '}').trim()

function childBasis(cols, gap, gapCount) {
  if (cols <= 1) return 'flex:0 0 100%;min-width:0'
  const g = gap * (cols - 1)
  return `flex:0 0 calc((100% - ${g}px)/${cols});min-width:0`
}
function parseCols(body) {
  const m = body.match(/repeat\((\d+),/)
  if (m) return +m[1]
  if (/grid-template-columns:[^;]*1fr/.test(body)) return 1
  return null
}
function parseGap(body, dflt) {
  const m = body.match(/(?:^|;)\s*gap:\s*([\d.]+)px/)
  return m ? +m[1] : dflt
}
const stripTpl = (body) => norm(body.replace(/grid-template-columns:[^;]+;?/g, ' '))

// ---------------- handlers ----------------
const H = {}

H['.auth-page'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.auth-story{flex:0.95 1 360px;min-width:360px}.auth-form-side{flex:1.05 1 420px}' }
  }
  if (b.includes('grid-template-columns:1fr')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, 'flex-direction:column;')), after: '.auth-story,.auth-form-side{flex:none}' }
  }
  return null
}
H['.auth-tabs'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.auth-tabs>button{flex:1 1 0;min-width:0}' }
}
H['.auth-roles'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.auth-roles>button{flex:1 1 0;min-width:0}' }
}
H['.feedback-gateway-actions'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex;flex-direction:column')) }
}
const twoBtn = (a) => `.${a}>.btn.secondary{flex:1 1 0;min-width:0}.${a}>.btn.primary{flex:2 1 0;min-width:0}`
H['.kitchen-name-actions'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: twoBtn('kitchen-name-actions') }
}
H['.stock-text-actions'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: twoBtn('stock-text-actions') }
}
H['.management-actions'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.management-actions>button{flex:1 1 0;min-width:0}' }
}
H['.editor-covers'] = (b) => {
  if (!b.includes('display:grid')) return null
  const gap = parseGap(b, 10)
  return { body: norm(b.replace('display:grid', 'display:flex;flex-wrap:wrap').replace(/grid-template-columns:[^;]+;?/, ' ')), after: `.editor-covers>button{${childBasis(3, gap)}}` }
}
H['.ingredient-amounts'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.ingredient-amounts>label{flex:1 1 0;min-width:0}' }
}
H['.stock-text-row-fields'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.stock-text-row-fields>label{flex:1 1 0;min-width:0}' }
}
H['.stock-text-row-fields label'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex;flex-direction:column')) }
}
H['.journal-layout'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start')), after: '.journal-calendar{flex:0.9 1 320px}.journal-day-detail{flex:1.2 1 0;min-width:0}' }
  }
  if (b.includes('grid-template-columns:1fr')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, 'flex-direction:column;align-items:stretch;')), after: '.journal-calendar,.journal-day-detail{flex:none}' }
  }
  return null
}
H['.journal-stats'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.journal-stats>label{flex:1 1 0;min-width:0}' }
}
H['.journal-days'] = (b) => {
  if (!b.includes('display:grid')) return null
  const gap = parseGap(b, 3)
  return { body: norm(b.replace('display:grid', 'display:flex;flex-wrap:wrap').replace(/grid-template-columns:[^;]+;?/, ' ')), after: `.journal-days>button{${childBasis(7, gap)}}` }
}
H['.stock-entry-actions'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.stock-entry-actions>button{flex:1 1 0;min-width:0}' }
}
H['.calendar-week,.calendar-grid'] = (b) => {
  if (!b.includes('display:grid')) return null
  const gap = parseGap(b, 3)
  return {
    body: norm(b.replace('display:grid', 'display:flex;flex-wrap:wrap').replace(/grid-template-columns:[^;]+;?/, ' ')),
    after: `.calendar-week>.el-span{${childBasis(7, gap)}}.calendar-grid>button,.calendar-grid>.el-span{${childBasis(7, gap)}}`,
  }
}
H['.calendar-week'] = (b) => {
  if (!/gap:/.test(b) || b.includes('grid')) return null
  const gap = parseGap(b, 3)
  return { body: b, after: `.calendar-week>.el-span{flex-basis:calc((100% - ${gap * 6}px)/7)}` }
}
H['.calendar-grid'] = (b) => {
  if (!/gap:/.test(b) || b.includes('grid')) return null
  const gap = parseGap(b, 3)
  return { body: b, after: `.calendar-grid>button,.calendar-grid>.el-span{flex-basis:calc((100% - ${gap * 6}px)/7)}` }
}
H['.menu-browser'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start')), after: '.menu-browser>.category-rail{flex:0 0 112px;min-width:0}.menu-browser>.menu-results{flex:1;min-width:0}' }
  }
  if (b.includes('grid-template-columns')) {
    const m = b.match(/grid-template-columns:(\d+)px/)
    const gap = parseGap(b, 20)
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, ' ')), after: `.menu-browser>.category-rail{flex-basis:${m[1]}px}` + (b.includes('gap') ? '' : '') }
  }
  return null
}
H['.mobile-recipe-nav'] = (b) => {
  if (!b.includes('display:grid')) return null
  const gap = parseGap(b, 10)
  return { body: norm(b.replace('display:grid', 'display:flex;flex-wrap:wrap').replace(/grid-template-columns:[^;]+;?/, ' ')), after: `.mobile-recipe-nav>button{${childBasis(2, gap)}}` }
}
H['.review-targets'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.review-targets>button{flex:0 0 130px;min-width:0}.review-targets>.review-dish-picker{flex:1;min-width:0}' }
  }
  if (b.includes('grid-template-columns')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.review-targets>button{flex-basis:122px}' }
  }
  return null
}
H['.menu-layout'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start')), after: '.menu-layout>.menu-main{flex:1;min-width:0}' }
  }
  if (b.includes('grid-template-columns')) {
    const nb = stripTpl(b)
    return nb ? { body: nb } : { drop: true }
  }
  return null
}
H['.menu-layout.no-cart'] = (b) => (b.includes('grid-template-columns') ? { drop: true } : null)

function wrapHandler(key, childSel, dfltGap, opts = {}) {
  return (b) => {
    if (b.includes('display:grid')) {
      const cols = parseCols(b)
      const gap = parseGap(b, dfltGap)
      const nb = norm(b.replace('display:grid', 'display:flex;flex-wrap:wrap').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start'))
      return { body: nb, after: `${childSel}{${childBasis(cols, gap)}}` }
    }
    if (b.includes('grid-template-columns')) {
      const cols = parseCols(b)
      const gap = parseGap(b, dfltGap)
      const nb = stripTpl(b)
      const after = `${childSel}{${childBasis(cols, gap)}}`
      if (nb) return { body: nb, after }
      return { drop: true, after }
    }
    if (opts.gapOnly && /gap:/.test(b)) {
      const gap = parseGap(b, dfltGap)
      const cols = opts.cols
      return { body: b, after: `${childSel}{${childBasis(cols, gap)}}` }
    }
    if (b.includes('display:grid') || b.includes('grid-')) throw new Error(key + ' unhandled grid body: ' + b)
    return null
  }
}
H['.dish-grid'] = wrapHandler('.dish-grid', '.dish-grid>.dish-card', 20, { gapOnly: true, cols: 2 })
H['.dish-grid,.no-cart .dish-grid'] = wrapHandler('.dish-grid,.no-cart .dish-grid', '.dish-grid>.dish-card,.no-cart .dish-grid>.dish-card', 20, { gapOnly: true, cols: 2 })
H['.no-cart .dish-grid'] = wrapHandler('.no-cart .dish-grid', '.no-cart .dish-grid>.dish-card', 20, { gapOnly: true, cols: 3 })
H['.inventory-grid'] = wrapHandler('.inventory-grid', '.inventory-grid>.stock-card', 18, { gapOnly: true, cols: 4 })
H['.settings-grid'] = wrapHandler('.settings-grid', '.settings-grid>.settings-card', 24, { gapOnly: true, cols: 2 })
H['.form-grid'] = wrapHandler('.form-grid', '.form-grid>.form-field', 16, { gapOnly: true, cols: 2 })

H['.chef-layout'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start')), after: '.chef-layout>.chef-main{flex:1 1 0;min-width:0}.chef-layout>.prep-card{flex:0 0 275px;min-width:0}' }
  }
  if (b.includes('grid-template-columns:minmax(0,1fr) 240px')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.chef-layout>.prep-card{flex-basis:240px}' }
  }
  if (b.includes('grid-template-columns:1fr')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, 'flex-direction:column;align-items:stretch;')), after: '.chef-layout>.chef-main,.chef-layout>.prep-card{flex:none}' }
  }
  return null
}
H['.recipe-modal'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ').replace('align-items:start', 'align-items:flex-start')), after: '.recipe-visual{flex:1 1 0;min-width:0}.recipe-modal>.el-div{flex:1 1 0;min-width:0}' }
  }
  if (b.includes('grid-template-columns')) {
    return { body: norm(b.replace(/grid-template-columns:[^;]+;?/, 'flex-direction:column;align-items:stretch;')), after: '.recipe-visual,.recipe-modal>.el-div{flex:none}' }
  }
  return null
}
H['.invite-type'] = (b) => {
  if (!b.includes('display:grid')) return null
  return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')), after: '.invite-type>button{flex:1 1 0;min-width:0}' }
}
H['.shopping-row'] = (b) => {
  if (b.includes('display:grid')) {
    return { body: norm(b.replace('display:grid', 'display:flex').replace(/grid-template-columns:[^;]+;?/, ' ')) + ';align-items:stretch' }
  }
  if (b.includes('display:flex')) return { body: b, after: '.ingredient-mid{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}' }
  return null
}
H['.ingredient-name'] = (b) => (norm(b) === 'grid-column:2' ? { drop: true } : null)
H['.ingredient-amount'] = (b) => (b.includes('grid-column:2') ? { body: norm(b.replace(/grid-column:2;/, '')) } : null)
H['.ingredient-status'] = (b) => (b.includes('grid-column:3') ? { body: norm(b.replace(/grid-column:3;\s*grid-row:1 \/ span 2;/, '')) } : null)
H['.check-wrap'] = (b) => (b.includes('grid-row') ? { body: norm(b.replace(/grid-row:1 \/ span 2;/, '')) } : null)
H['.account-bar'] = (b) => {
  if (b.includes('status-bar-height')) return null
  if (b.includes('padding-top:5px')) return { body: norm(b.replace('padding-top:5px', 'padding-top:calc(var(--status-bar-height,0px) + 5px)')) }
  return null
}
H['.auth-form-side'] = (b) => {
  if (b.includes('status-bar-height')) return null
  if (b.includes('padding:27px 23px 24px')) return { body: norm(b) + ';padding-top:calc(var(--status-bar-height,0px) + 36px)' }
  return null
}

// ---------------- transformer ----------------
function transform(css, fileTag) {
  let out = ''
  let i = 0
  while (i < css.length) {
    const nextBrace = css.indexOf('{', i)
    const nextClose = css.indexOf('}', i)
    if (nextClose >= 0 && (nextBrace < 0 || nextClose < nextBrace)) {
      out += css.slice(i, nextClose + 1)
      i = nextClose + 1
      continue
    }
    if (nextBrace < 0) { out += css.slice(i); break }
    let prelude = css.slice(i, nextBrace)
    if (prelude.trim().startsWith('@')) {
      out += prelude + '{'
      i = nextBrace + 1
      continue
    }
    let depth = 1
    let j = nextBrace + 1
    let q = null
    while (j < css.length && depth > 0) {
      const ch = css[j]
      if (q) { if (ch === q) q = null; else if (ch === '\\') j++ }
      else if (ch === '"' || ch === "'") q = ch
      else if (ch === '{') depth++
      else if (ch === '}') depth--
      j++
    }
    const body = css.slice(nextBrace + 1, j - 1)
    const key = prelude.trim()
    let res = null
    const handler = H[key]
    if (handler) {
      res = handler(body)
      if (res) bump(key)
    } else if (/grid-template|grid-column|grid-row|justify-items|place-content/.test(body) || (/display:\s*(inline-)?grid/.test(body) && !body.includes('place-items'))) {
      throw new Error(`[${fileTag}] unhandled grid rule: ${key} {${body.replace(/\s+/g, ' ')}}`)
    }
    let newPrelude = rewriteTags(prelude)
    if (res) {
      if (res.drop && !res.body) {
        // drop rule entirely
        if (res.after) {
          if (!rawAll.includes(res.after) && !out.includes(res.after)) {
            out += res.after
            addedAfter.push(res.after)
          }
        }
        out += ''
      } else {
        out += newPrelude + '{' + res.body + '}'
        if (res.after && !rawAll.includes(res.after) && !out.includes(res.after)) {
          out += res.after
          addedAfter.push(res.after)
        }
      }
    } else {
      out += newPrelude + '{' + body + '}'
    }
    i = j
  }
  return out
}

// generic place-items pass (rules without specific handler)
function placeItemsPass(css) {
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
    if (!body.includes('place-items')) return m
    let nb = body
      .replace(/display:inline-grid/g, 'display:inline-flex')
      .replace(/display:grid/g, 'display:flex')
      .replace(/place-items:center/g, 'align-items:center;justify-content:center')
    bump('place-items:' + sel.trim().slice(0, 40))
    return sel + '{' + nb + '}'
  })
}

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(css|vue)$/.test(e.name) ? [path.join(d, e.name)] : []))
}

const files = walk(SRC)
const raws = {}
for (const f of files) raws[f] = fs.readFileSync(f, 'utf8')
const rawAll = Object.values(raws).join('\n')

let changed = 0
for (const f of files) {
  const raw = raws[f]
  let out
  if (f.endsWith('.vue')) {
    out = raw.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, inner, close) => open + placeItemsPass(transform(inner, path.basename(f))) + close)
    if (out !== raw) { bump('file:' + path.basename(f)); changed++ }
  } else {
    out = placeItemsPass(transform(raw, path.basename(f)))
    if (out !== raw) { bump('file:' + path.basename(f)); changed++ }
  }
  if (out !== raw) fs.writeFileSync(f, out)
}

// final scan
const LEFTOVER = /(^|[;{\s])(grid-|place-items|place-content|justify-items|display:\s*(inline-)?grid)/
let leftovers = []
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  const scan = f.endsWith('.vue') ? (t.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join('\n') : t
  let m
  const re = /([^{}]+)\{([^{}]*)\}/g
  while ((m = re.exec(scan))) {
    if (LEFTOVER.test(m[2])) leftovers.push(f + ' :: ' + m[1].trim().slice(-80) + ' {' + m[2].replace(/\s+/g, ' ').slice(0, 120) + '}')
  }
}
console.log('=== handler hits ===')
for (const [k, v] of Object.entries(stats).sort()) console.log(String(v).padStart(3), k)
console.log('files changed:', changed, 'companions added:', addedAfter.length)
if (leftovers.length) {
  console.log('LEFTOVER GRID PROPS:')
  leftovers.forEach((l) => console.log('  ' + l))
  process.exitCode = 1
} else console.log('no grid/place-items props left in src styles')
