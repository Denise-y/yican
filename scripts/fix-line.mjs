import fs from 'node:fs'
const p = 'D:/yican-miniprogram/scripts/wxss-fix.mjs'
let t = fs.readFileSync(p, 'utf8')
const lines = t.split('\n')
lines[397] = "} else console.log('no grid/place-items props left in src styles')"
t = lines.join('\n')
fs.writeFileSync(p, t, 'utf8')
console.log('line398 =', lines[397])
