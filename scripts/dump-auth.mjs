import fs from 'node:fs'
const files = ['app.wxss', 'MainView.wxss', 'index/index.wxss', 'components/AuthScreen.wxss']
let out = ''
for (const f of files) {
  try { out += fs.readFileSync('D:/yican-miniprogram/dist/build/mp-weixin/' + f, 'utf8') + '\n' } catch (e) { console.log('miss', f) }
}
const re = /(@media[^{]+)\{|([^{}]+)\{([^{}]*)\}|(\})/g
let m, curMedia = null
const depth = []
while ((m = re.exec(out))) {
  if (m[1]) { depth.push(curMedia); curMedia = m[1].trim() }
  else if (m[2] !== undefined) {
    const sel = m[2].trim().replace(/\s+/g, ' ')
    const body = m[3].replace(/\s+/g, ' ').trim()
    const parts = sel.split(',').map((s) => s.trim())
    if (parts.some((s) => /^(button|\*|\.el-div|view)$/.test(s)) && /display|width|flex|wrap/.test(body)) {
      console.log(`[${curMedia || 'base'}] ${sel} { ${body} }`)
    }
    if (parts.some((s) => s.includes('auth-tabs') || s.includes('auth-form-side'))) {
      console.log(`(auth) [${curMedia || 'base'}] ${sel} { ${body} }`)
    }
  } else if (m[4]) curMedia = depth.pop() || null
}
