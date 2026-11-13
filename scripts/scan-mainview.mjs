import fs from 'node:fs'

const f = 'D:/yican-miniprogram/src/MainView.vue'
const t = fs.readFileSync(f, 'utf8')
const re = /<select[\s\S]*?<\/select>|<input[^>]*type=["'](checkbox|date|time)["'][^>]*>|type="submit"|form="[a-z-]+"/g
let m
while ((m = re.exec(t))) {
  const line = t.slice(0, m.index).split(/\r?\n/).length
  console.log(line + ': ' + m[0].slice(0, 220))
}
