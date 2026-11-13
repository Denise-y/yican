// 把 public/images 公有读上传到 COS：COS_SECRET_ID / COS_SECRET_KEY / COS_BUCKET / COS_REGION=ap-shanghai
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, extname } from 'node:path'
import COS from 'cos-nodejs-sdk-v5'

const { COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION = 'ap-shanghai' } = process.env
if (!COS_SECRET_ID || !COS_SECRET_KEY || !COS_BUCKET) {
  console.error('缺少环境变量：COS_SECRET_ID / COS_SECRET_KEY / COS_BUCKET')
  process.exit(1)
}
const cos = new COS({ SecretId: COS_SECRET_ID, SecretKey: COS_SECRET_KEY, Timeout: 120000 })
const source = resolve(import.meta.dirname, '..', 'public', 'images')

const files = []
const walk = dir => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else files.push(full)
  }
}
walk(source)
console.log(`待上传 ${files.length} 个文件，目标 cos://${COS_BUCKET}/${COS_REGION}/images/`)

const batch = 8
let done = 0
for (let i = 0; i < files.length; i += batch) {
  await Promise.all(files.slice(i, i + batch).map(async full => {
    const key = `images/${relative(source, full).split('\\').join('/')}`
    const body = readFileSync(full)
    const contentType = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }[extname(full)] || 'application/octet-stream'
    await new Promise((ok, fail) => cos.putObject(
      { Bucket: COS_BUCKET, Region: COS_REGION, Key: key, Body: body, ContentType: contentType, ACL: 'public-read' },
      error => error ? fail(error) : ok()))
    done++
    if (done % 20 === 0 || done === files.length) console.log(`进度 ${done}/${files.length}`)
  }))
}
console.log(`完成。前端 VITE_IMAGE_BASE=https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`)
