import fs from 'node:fs'

const dist = 'D:/yican-miniprogram/dist/build/mp-weixin'

function childrenOf(file, cls) {
  const t = fs.readFileSync(file, 'utf8')
  let idx = t.indexOf('"' + cls + ' ')
  if (idx < 0) idx = t.indexOf('"' + cls + '"')
  if (idx < 0) idx = t.indexOf("'" + cls + "'")
  if (idx < 0) {
    // class may be inside {{[...]}} expression
    idx = t.indexOf("'" + cls + "',")
  }
  if (idx < 0) return console.log(`${cls}: NOT FOUND`)
  const s = t.lastIndexOf('<', idx)
  const st = />/.exec(t.slice(s))
  const innerStart = s + st.index + 1
  const elemRe = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
  elemRe.lastIndex = innerStart
  let depth = 1
  let innerEnd = t.length
  let m
  while ((m = elemRe.exec(t))) {
    const full = t.slice(m.index, elemRe.lastIndex)
    if (m[1]) {
      depth--
      if (depth === 0) {
        innerEnd = m.index
        break
      }
    } else if (!full.endsWith('/>')) depth++
  }
  const inner = t.slice(innerStart, innerEnd)
  const kids = []
  const kre = /<(\/)?([a-z-]+)((?:"[^"]*"|[^>"'])*)>/g
  let kd = 0
  let k
  while ((k = kre.exec(inner))) {
    const kf = inner.slice(k.index, kre.lastIndex)
    if (k[1]) {
      kd--
      continue
    }
    if (kd === 0) {
      const cm = k[3].match(/class="([^"]*)"/)
      const names = cm
        ? '.' + cm[1].replace(/\{\{[^}]*\}\}/g, ' ').split(/\s+/).filter((c) => c && !c.startsWith('data-v')).join('.')
        : ''
      kids.push(k[2] + names)
    }
    if (!kf.endsWith('/>')) kd++
  }
  console.log(`${cls}: ${kids.join(' | ').slice(0, 300)}`)
}

childrenOf(dist + '/MainView.wxml', 'menu-layout')
childrenOf(dist + '/MainView.wxml', 'calendar-grid')
childrenOf(dist + '/MainView.wxml', 'calendar-week')
childrenOf(dist + '/MainView.wxml', 'shopping-row')
childrenOf(dist + '/components/AuthScreen.wxml', 'auth-page')
childrenOf(dist + '/components/AuthScreen.wxml', 'auth-roles')
childrenOf(dist + '/components/AuthScreen.wxml', 'auth-tabs')
childrenOf(dist + '/components/MealJournal.wxml', 'journal-stats')
childrenOf(dist + '/MainView.wxml', 'menu-browser')

// menu-layout raw segment for cart detection
const mv = fs.readFileSync(dist + '/MainView.wxml', 'utf8')
const mi = mv.indexOf("'menu-layout'")
if (mi >= 0) {
  const seg = mv.slice(mi, mi + 4000)
  console.log('\nmenu-layout segment has cart?', /class="[^"]*cart/.test(seg) ? 'YES' : seg.includes('cart') ? 'cart-text' : 'NO')
  const cm = seg.match(/class="([^"]{0,120})"/g)
  console.log('classes in segment:', (cm || []).slice(0, 12).join(' // '))
}
