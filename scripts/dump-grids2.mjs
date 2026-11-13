import fs from 'node:fs'
import path from 'node:path'

const SRC = 'D:/yican-miniprogram/src'

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.(css|vue)$/.test(e.name)) yield p
  }
}

// token-scan css with media stack; report rules whose body contains display:grid
function scan(file, css) {
  const stack = [] // media queries
  let i = 0
  const out = []
  while (i < css.length) {
    const nextBrace = css.indexOf('{', i)
    const nextClose = css.indexOf('}', i)
    if (nextClose >= 0 && (nextBrace < 0 || nextClose < nextBrace)) {
      stack.pop()
      i = nextClose + 1
      continue
    }
    if (nextBrace < 0) break
    const prelude = css.slice(i, nextBrace).trim()
    if (prelude.startsWith('@media')) {
      stack.push(prelude)
      i = nextBrace + 1
      continue
    }
    if (prelude.startsWith('@')) {
      // @supports/@keyframes etc: skip block naively
      stack.push(prelude)
      i = nextBrace + 1
      continue
    }
    // find matching close for rule
    let depth = 1
    let j = nextBrace + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    const body = css.slice(nextBrace + 1, j - 1)
    if (/display\s*:\s*grid/.test(body)) {
      out.push({ file, media: stack[stack.length - 1] || '(base)', selector: prelude, body: body.replace(/\s+/g, ' ').trim() })
    }
    i = j
  }
  return out
}

const all = []
for (const f of walk(SRC)) {
  const raw = fs.readFileSync(f, 'utf8')
  if (f.endsWith('.vue')) {
    const m = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []
    for (const blk of m) {
      const inner = blk.replace(/^<style[^>]*>/, '').replace(/<\/style>$/, '')
      all.push(...scan(f + ' <style>', inner))
    }
  } else {
    all.push(...scan(f, raw))
  }
}
console.log('TOTAL display:grid rules:', all.length)
for (const r of all) {
  console.log(`\n[${path.basename(r.file)}] ${r.media}\n  ${r.selector}\n    {${r.body.slice(0, 300)}}`)
}
