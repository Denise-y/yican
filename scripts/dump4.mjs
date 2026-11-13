import fs from 'node:fs'
const t = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
const i = t.indexOf('class="menu-layout"')
// print region after menu-main section ends: find '</section>' after i, then next 1500 chars
const secEnd = t.indexOf('</section>', i)
console.log('--- after menu-main </section> ---')
console.log(t.slice(secEnd, secEnd + 1500))
// also search where cart div (non-modal) is: class="cart" occurrences
let p = 0
while ((p = t.indexOf('class="cart', p)) >= 0) {
  console.log('cart@', p, '::', t.slice(p - 120, p + 60).replace(/\s+/g, ' ').slice(0, 180))
  p += 10
}
