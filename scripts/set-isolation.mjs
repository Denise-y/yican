// Build post-step: inject styleIsolation into every component .json.
// uni only sets options.addGlobalClass in JS (deprecated path); some base
// libraries / glass-easel ignore it, which leaves component nodes unstyled
// by app.wxss (symptom: .auth-tabs stays stacked in two rows).
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] || 'dist/build/mp-weixin')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.json')) out.push(p)
  }
  return out
}

let changed = 0
for (const file of walk(root)) {
  const base = path.basename(file)
  if (base === 'app.json') continue
  const j = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (j.component !== true) continue // pages default to shared
  if (j.styleIsolation === 'apply-shared') continue
  j.styleIsolation = 'apply-shared'
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n', 'utf8')
  changed++
}
console.log(`[set-isolation] ${changed} component json(s) -> styleIsolation: apply-shared`)
