import fs from 'node:fs'
import path from 'node:path'

const SRC = 'D:/yican-miniprogram/src'
const SELS = [
  'auth-page', 'auth-tabs', 'auth-roles', 'feedback-gateway-actions', 'management-actions',
  'kitchen-name-actions', 'editor-covers', 'ingredient-amounts', 'stock-text-row-fields',
  'stock-text-actions', 'journal-layout', 'journal-stats', 'journal-days', 'stock-entry-actions',
  'calendar-week', 'calendar-grid', 'menu-browser', 'mobile-recipe-nav', 'review-targets',
  'menu-layout', 'dish-grid', 'chef-layout', 'inventory-grid', 'settings-grid', 'recipe-modal',
  'invite-type', 'form-grid', 'shopping-row', 'prep-icon', 'category-rail', 'menu-results',
  'journal-calendar', 'journal-day-detail', 'settings-card', 'stock-card', 'ingredient-name',
  'ingredient-amount', 'ingredient-status', 'check-wrap', 'account-bar', 'demo-bar',
  'auth-form-side', 'dish-card', 'chef-main',
]

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.(css|vue)$/.test(e.name)) yield p
  }
}

function scan(css, tag) {
  const stack = []
  let i = 0
  while (i < css.length) {
    const nextBrace = css.indexOf('{', i)
    const nextClose = css.indexOf('}', i)
    if (nextClose >= 0 && (nextBrace < 0 || nextClose < nextBrace)) {
      stack.pop(); i = nextClose + 1; continue
    }
    if (nextBrace < 0) break
    const prelude = css.slice(i, nextBrace).trim()
    if (prelude.startsWith('@')) { stack.push(prelude); i = nextBrace + 1; continue }
    let depth = 1, j = nextBrace + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    const body = css.slice(nextBrace + 1, j - 1)
    if (SELS.some((s) => new RegExp('(^|[\\s,])\\.' + s + '(?![a-z-])').test(prelude))) {
      const media = stack[stack.length - 1] || '(base)'
      console.log(`[${tag}] ${media}\n  SEL: ${prelude.replace(/\s+/g, ' ')}\n  BODY: {${body.replace(/\s+/g, ' ').trim()}}`)
    }
    i = j
  }
}

for (const f of walk(SRC)) {
  const raw = fs.readFileSync(f, 'utf8')
  const rel = f.slice(SRC.length + 1)
  if (f.endsWith('.vue')) {
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g
    let m
    while ((m = re.exec(raw))) scan(m[1], rel + ' <style>')
  } else scan(raw, rel)
}
