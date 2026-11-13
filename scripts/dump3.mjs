import fs from 'node:fs'
const t = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
const i = t.indexOf('class="menu-layout"')
// find the closing of this div: track depth
let depth = 0
let j = t.indexOf('>', i) + 1
let k = j
const tagRe = /<(\/)?(div|section|article|nav|aside|main|header|footer|button|label|p|span|h[1-6]|form|ul|li|small|b|strong|em|i|a)\b[^>]*>/g
tagRe.lastIndex = j
let m
let endPos = t.length
while ((m = tagRe.exec(t))) {
  const isClose = m[1]
  const selfClosing = /\/>$/.test(m[0])
  if (isClose) {
    depth--
    if (depth < 0) { endPos = m.index; break }
  } else if (!selfClosing) depth++
}
const inner = t.slice(j, endPos)
console.log('menu-layout inner length:', inner.length)
// direct children: track depth
const kre = /<(\/)?([a-z][a-z0-9-]*)\b[^>]*>/g
let kd = 0
let kres
const kids = []
const kidsRe = /<(\/)?([a-z][a-z0-9-]*)([^>]*)>/g
while ((kres = kidsRe.exec(inner))) {
  const tag = kres[2]
  const attrs = kres[3]
  const selfClosing = /\/>$/.test(kres[0])
  if (kres[1]) { kd--; continue }
  if (kd === 0 && !['input', 'img', 'br'].includes(tag)) {
    const cm = attrs.match(/class="([^"]*)"/)
    kids.push(tag + (cm ? '.' + cm[1].split(/\s+/).join('.') : ''))
  }
  if (!selfClosing) kd++
}
console.log('direct children:', kids.join(' | '))

// Where does cart/aside appear relative to menu-main? search for 'aside' or cart within menu-layout inner
console.log('inner has cart?', inner.includes('cart-panel'), inner.includes('class="cart'))
// find tail of inner
console.log('--- TAIL 800 ---')
console.log(inner.slice(-800))
