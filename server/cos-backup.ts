import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import COS from 'cos-nodejs-sdk-v5'

interface CosConfig { secretId: string; secretKey: string; bucket: string; region: string; key: string }

function config(): CosConfig | null {
  const secretId = process.env.YICAN_COS_SECRET_ID, secretKey = process.env.YICAN_COS_SECRET_KEY
  const bucket = process.env.YICAN_COS_BUCKET, region = process.env.YICAN_COS_REGION
  if (!secretId || !secretKey || !bucket || !region) return null
  const prefix = (process.env.YICAN_COS_PREFIX || 'backup').replace(/^\/+|\/+$/g, '')
  return { secretId, secretKey, bucket, region, key: prefix ? `${prefix}/kitchen.sqlite.gz` : 'kitchen.sqlite.gz' }
}

function client(cfg: CosConfig) {
  return new COS({ SecretId: cfg.secretId, SecretKey: cfg.secretKey, Timeout: 120000 })
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** 容器磁盘不持久化：启动时从对象存储恢复数据库（本地已有文件则跳过）。 */
export async function restoreDatabase(dbPath: string): Promise<void> {
  const cfg = config()
  if (!cfg) {
    if (process.env.YICAN_COS_BUCKET || process.env.YICAN_COS_SECRET_ID) {
      throw new Error('对象存储配置不完整：需要 YICAN_COS_SECRET_ID / YICAN_COS_SECRET_KEY / YICAN_COS_BUCKET / YICAN_COS_REGION 四个环境变量')
    }
    console.log('未配置云端备份（YICAN_COS_*），直接使用本地数据库。')
    return
  }
  if (existsSync(dbPath)) { console.log('本地数据库已存在，跳过云端恢复。'); return }
  const cos = client(cfg)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await new Promise<{ Body?: Buffer }>((resolve, reject) =>
        cos.getObject({ Bucket: cfg.bucket, Region: cfg.region, Key: cfg.key }, (error, result) => error ? reject(error) : resolve(result as { Body?: Buffer })))
      const body = data.Body
      if (!body || !body.length) throw Object.assign(new Error('备份为空'), { statusCode: 404 })
      mkdirSync(dirname(dbPath), { recursive: true })
      // 先落临时文件再原子改名，避免下载中断留下半个数据库。
      const partial = `${dbPath}.restoring`
      writeFileSync(partial, gunzipSync(body))
      renameSync(partial, dbPath)
      console.log(`已从对象存储恢复数据库（压缩 ${(body.length / 1048576).toFixed(2)}MB）。`)
      return
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status
      if (status === 404 || error?.code === 'NoSuchKey') { console.log('云端暂无备份，按全新数据库初始化。'); return }
      if (attempt === 3) throw new Error(`云端数据库恢复失败：${error?.message || error}`)
      console.log(`云端恢复失败，${attempt}/3 重试：${error?.message || error}`)
      await sleep(attempt * 1500)
    }
  }
}

/** 写操作后防抖备份；shutdown 时 flush，保证重启可恢复。 */
export function createBackupScheduler(dbPath: string, snapshot: (target: string) => void) {
  const cfg = config()
  let dirty = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let current: Promise<void> | null = null

  async function upload(): Promise<void> {
    if (!cfg) return
    const partial = `${dbPath}.cosbak`
    try {
      rmSync(partial, { force: true })
      let lastError: unknown
      for (let attempt = 1; attempt <= 5; attempt++) {
        try { snapshot(partial); lastError = null; break } catch (error) { lastError = error; await sleep(200) }
      }
      if (lastError) throw lastError
      const gz = gzipSync(readFileSync(partial))
      const cos = client(cfg)
      await new Promise<void>((resolve, reject) =>
        cos.putObject({ Bucket: cfg.bucket, Region: cfg.region, Key: cfg.key, Body: gz, ContentType: 'application/gzip' },
          error => error ? reject(error) : resolve()))
      dirty = false
      console.log(`数据库已备份到对象存储（压缩 ${(gz.length / 1048576).toFixed(2)}MB）。`)
    } catch (error: any) {
      dirty = true
      console.error(`数据库备份失败，稍后重试：${error?.message || error}`)
      if (!timer) timer = setTimeout(() => { timer = null; void run() }, 15000)
    } finally {
      rmSync(partial, { force: true })
    }
  }

  function run(): Promise<void> {
    if (!dirty) return Promise.resolve()
    if (current) return current
    current = upload().finally(() => { current = null })
    return current
  }

  function schedule() {
    if (!cfg || timer) return
    timer = setTimeout(() => { timer = null; void run() }, 5000)
  }

  return {
    note() { if (!cfg) return; dirty = true; schedule() },
    async flush() {
      if (!cfg) return
      if (timer) { clearTimeout(timer); timer = null }
      if (current) await current
      if (dirty) await run()
    },
  }
}
