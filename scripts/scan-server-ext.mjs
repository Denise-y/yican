import fs from 'node:fs'
const dir = 'D:/yican-miniprogram/server'
const externals = new Set()
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.ts')) continue
  const t = fs.readFileSync(dir + '/' + f, 'utf8')
  const re = /from\s+['"]([^'".][^'"]*)['"]/g
  let m
  while ((m = re.exec(t))) externals.add(m[1].split('/').slice(0, m[1].startsWith('@') ? 2 : 1).join('/'))
}
console.log([...externals].join('\n'))
