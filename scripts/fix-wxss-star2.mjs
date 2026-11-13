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

const file = 'D:/yican-miniprogram/src/style.css'
const from = '@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}'
const to = `@media(prefers-reduced-motion:reduce){${ELEMENTS}{transition:none!important;scroll-behavior:auto!important}}`
let t = fs.readFileSync(file, 'utf8')
const count = t.split(from).length - 1
if (count !== 1) {
  console.log(`FAIL: expected 1x got ${count}x`)
  process.exit(1)
}
fs.writeFileSync(file, t.split(from).join(to))
console.log('OK media-star fixed')
