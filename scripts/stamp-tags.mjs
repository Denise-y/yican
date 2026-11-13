import fs from 'node:fs'
import path from 'node:path'

const MAP = ['br', 'hr', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'abbr', 'address', 'b', 'bdi', 'bdo', 'blockquote', 'cite', 'code', 'del', 'ins', 'dfn', 'em', 'strong', 'samp', 'kbd', 'var', 'i', 'mark', 'pre', 'q', 'ruby', 'rp', 'rt', 's', 'small', 'sub', 'sup', 'time', 'u', 'wbr', 'select', 'option', 'optgroup', 'fieldset', 'datalist', 'legend', 'output', 'iframe', 'img', 'figure', 'figcaption', 'source', 'track', 'a', 'nav', 'link', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu', 'command', 'table', 'caption', 'th', 'td', 'tr', 'thead', 'tbody', 'tfoot', 'col', 'colgroup', 'div', 'main', 'span', 'header', 'footer', 'section', 'article', 'aside', 'details', 'dialog', 'summary', 'meter', 'head', 'meta', 'base', 'area', 'script', 'noscript', 'embed', 'object', 'param']
const SET = new Set(MAP)

const SRC = 'D:/yican-miniprogram/src'
function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.vue$/.test(e.name) ? [path.join(d, e.name)] : []))
}

function stampSegment(seg) {
  let out = ''
  let i = 0
  let count = 0
  while (i < seg.length) {
    const lt = seg.indexOf('<', i)
    if (lt < 0) { out += seg.slice(i); break }
    out += seg.slice(i, lt)
    if (seg.startsWith('<!--', lt)) {
      const end = seg.indexOf('-->', lt)
      const stop = end < 0 ? seg.length : end + 3
      out += seg.slice(lt, stop)
      i = stop
      continue
    }
    if (seg[lt + 1] === '/') {
      const gt = seg.indexOf('>', lt)
      const stop = gt < 0 ? seg.length : gt + 1
      out += seg.slice(lt, stop)
      i = stop
      continue
    }
    let j = lt + 1
    while (j < seg.length && /[a-zA-Z0-9-]/.test(seg[j])) j++
    const rawTag = seg.slice(lt + 1, j)
    const tag = rawTag.toLowerCase()
    let k = j
    let q = null
    while (k < seg.length) {
      const ch = seg[k]
      if (q) { if (ch === q) q = null }
      else if (ch === '"' || ch === "'") q = ch
      else if (ch === '>') break
      k++
    }
    if (k >= seg.length) { out += seg.slice(lt); break }
    let attrs = seg.slice(j, k)
    if (SET.has(tag) && tag !== 'script' && tag !== 'style') {
      const token = 'el-' + tag
      const cm = /class="([^"]*)"/.exec(attrs)
      if (cm) {
        if (!cm[1].split(/\s+/).includes(token)) {
          attrs = attrs.replace(/class="([^"]*)"/, (_, c) => 'class="' + c + ' ' + token + '"')
          count++
        }
      } else {
        if (/\s\/$/.test(attrs)) {
          attrs = attrs.replace(/(\s*)\/$/, ' class="' + token + '"$1/')
        } else {
          attrs = attrs + ' class="' + token + '"'
        }
        count++
      }
      out += '<' + rawTag + attrs + '>'
    } else {
      out += seg.slice(lt, k + 1)
    }
    i = k + 1
  }
  return { out, count }
}

let total = 0
for (const f of walk(SRC)) {
  const raw = fs.readFileSync(f, 'utf8')
  const parts = []
  const re = /<(script|style)(\s[^>]*)?>[\s\S]*?<\/\1>/g
  let last = 0
  let m
  const between = []
  while ((m = re.exec(raw))) {
    between.push([last, m.index])
    last = m.index + m[0].length
  }
  between.push([last, raw.length])
  let out = ''
  let prev = 0
  let c = 0
  for (const [s, e] of between) {
    out += raw.slice(prev, s)
    const seg = raw.slice(s, e)
    const r = stampSegment(seg)
    out += r.out
    c += r.count
    prev = e
  }
  out += raw.slice(prev)
  if (c > 0) {
    fs.writeFileSync(f, out)
    console.log(path.basename(f), '+' + c)
    total += c
  }
}
console.log('TOTAL stamped:', total)
