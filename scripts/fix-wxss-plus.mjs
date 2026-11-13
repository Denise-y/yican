import fs from 'node:fs'

let failures = 0
function replace(file, pairs) {
  let t = fs.readFileSync(file, 'utf8')
  for (const [from, to, expect = 1] of pairs) {
    const count = t.split(from).length - 1
    if (count !== expect) {
      console.log(`FAIL ${file}: expected ${expect}x got ${count}x >>${from.slice(0, 70)}<<`)
      failures++
      continue
    }
    t = t.split(from).join(to)
    console.log(`OK   ${file}: ${count}x  ${from.slice(0, 70)}`)
  }
  fs.writeFileSync(file, t)
}

replace('D:/yican-miniprogram/src/style.css', [
  ['.check-wrap input:focus-visible+.check-visual{outline:2px solid #b18454;outline-offset:3px}', '', 1],
  ['.check-wrap input:checked+.check-visual{background:#8c8277;border-color:#8c8277;color:white}', '', 1],
])

replace('D:/yican-miniprogram/src/mobile-warm.css', [
  ['.check-wrap input:checked+.check-visual{background:#64845a;border-color:#64845a}', '', 1],
])

if (failures) {
  console.log(`\n${failures} FAILURE(S)`)
  process.exit(1)
}
console.log('\nALL APPLIED')
