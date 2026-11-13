import fs from 'node:fs'

const ELEMENTS = [
  'page', 'view', 'text', 'button', 'input', 'textarea', 'label', 'form',
  'picker', 'picker-view', 'checkbox', 'radio', 'switch', 'slider', 'progress',
  'scroll-view', 'swiper', 'swiper-item', 'image', 'icon', 'navigator', 'rich-text',
  'block', 'cover-view', 'cover-image', 'movable-view', 'video', 'audio', 'canvas', 'web-view',
  'main-view', 'auth-screen', 'invite-landing', 'modal', 'yi-check', 'yi-select', 'food-art',
  'review-feed', 'icon-glyph', 'kitchen-name-editor', 'review-center', 'theme-picker',
  'meal-journal', 'account-settings', 'feedback-gateway', 'kitchen-management',
  'recipe-editor', 'stock-text-entry', 'yi-picker-field', 'account-root',
].join(',')

let failures = 0
function replace(file, pairs) {
  let t = fs.readFileSync(file, 'utf8')
  for (const [from, to, expect = 1] of pairs) {
    const parts = t.split(from)
    const count = parts.length - 1
    if (count !== expect) {
      console.log(`FAIL ${file}: expected ${expect}x, got ${count}x  >>${from.slice(0, 80)}<<`)
      failures++
      continue
    }
    t = parts.join(to)
    console.log(`OK   ${file}: ${count}x  ${from.slice(0, 70)}`)
  }
  fs.writeFileSync(file, t)
}

replace('D:/yican-miniprogram/src/style.css', [
  ['*{box-sizing:border-box}', ELEMENTS + '{box-sizing:border-box}'],
  ['button:hover:not(:disabled){filter:brightness(.97)}', '', 1],
  ['.primary:hover:not(:disabled){background:var(--orange-dark)}', '', 1],
  ['.shopping-summary span:not(.summary-icon)', '.shopping-summary>view>view,.shopping-summary>view>label', 2],
])

replace('D:/yican-miniprogram/src/account.css', [
  ['input:not([type=checkbox])', 'input', 2],
])

replace('D:/yican-miniprogram/src/mobile-warm.css', [
  ['.calendar-grid button:hover:not(:disabled){background:#fff0df}', '', 1],
])

replace('D:/yican-miniprogram/src/themes.css', [
  ['.calendar-grid button:hover:not(:disabled),', '', 1],
  ['.sync-status:not(.offline)', '.sync-status.online', 1],
  ['.shopping-summary span:not(.summary-icon)', '.shopping-summary>view>view,.shopping-summary>view>label', 1],
])

replace('D:/yican-miniprogram/src/MainView.vue', [
  [":class=\"{offline:sharedStatus==='offline'}\"", ":class=\"{offline:sharedStatus==='offline',online:sharedStatus==='online'}\"", 1],
])

if (failures) {
  console.log(`\n${failures} FAILURE(S)`)
  process.exit(1)
}
console.log('\nALL APPLIED')
