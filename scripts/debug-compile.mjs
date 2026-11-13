import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import fs from 'node:fs'

const src = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
const { descriptor, errors } = parse(src, { filename: 'MainView.vue' })
console.log('parse errors:', errors.length)
try {
  const script = compileScript(descriptor, { id: 'x' })
  console.log('script ok, bindings:', Object.keys(script.bindings || {}).length)
} catch (e) {
  console.log('script ERROR:', e.message)
}
try {
  const tpl = compileTemplate({
    source: descriptor.template.content,
    filename: 'MainView.vue',
    id: 'x',
    compilerOptions: { bindingMetadata: {} },
  })
  console.log('template errors:', tpl.errors.length)
  for (const e of tpl.errors) {
    console.log('ERR:', typeof e === 'string' ? e : e.message || JSON.stringify(e))
    if (e && e.loc) console.log('  loc:', JSON.stringify(e.loc).slice(0, 300))
  }
} catch (e) {
  console.log('template THROWN:', e.message)
  console.log(e.stack?.split('\n').slice(0, 6).join('\n'))
}
