import fs from 'node:fs'

const P = 'D:/yican-miniprogram/src/MainView.vue'
let t = fs.readFileSync(P, 'utf8')
let n = 0

function rep(old, to, label) {
  const c = t.split(old).length - 1
  if (c === 0) {
    console.log('SKIP (already done):', label)
    return
  }
  if (c > 1) throw new Error(label + ': found ' + c + ' matches, expected 1')
  t = t.replace(old, to)
  n++
  console.log('OK:', label)
}

// 1) wrap ingredient-name + ingredient-amount into .ingredient-mid
rep(
  '@change="checkRow(r)"/></label><div class="ingredient-name">',
  '@change="checkRow(r)"/></label><div class="ingredient-mid"><div class="ingredient-name">',
  'shopping-row: open mid'
)
rep(
  "qty(r.available,r.unit)}}</span></div><span class=\"ingredient-status\"",
  "qty(r.available,r.unit)}}</span></div></div><span class=\"ingredient-status\"",
  'shopping-row: close mid'
)

// 2) chef-layout first child gets a class
rep(
  '<div class="chef-layout"><section>',
  '<div class="chef-layout"><section class="chef-main">',
  'chef-main class'
)

fs.writeFileSync(P, t)
console.log('applied', n, 'edits')
