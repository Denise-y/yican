import fs from 'node:fs'
const p = 'D:/yican-miniprogram/src/components/RecipeEditor.vue'
let t = fs.readFileSync(p, 'utf8')
const i = t.indexOf('<datalist id="recipe-unit-options">')
if (i >= 0) {
  const j = t.indexOf('</datalist>', i)
  t = t.slice(0, i) + t.slice(j + '</datalist>'.length)
  fs.writeFileSync(p, t, 'utf8')
  console.log('removed datalist')
} else {
  console.log('not found')
}
