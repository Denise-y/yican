import { API_BASE, CLOUD_ENV, CLOUD_SERVICE } from './config'

interface WxLike { cloud?: { init: (config?: unknown) => void; callContainer: (options: Record<string, unknown>) => void } }
const wxApi = (globalThis as unknown as { wx?: WxLike }).wx

/** 云托管模式：配置了 VITE_CLOUD_ENV 且当前为微信小程序时，走 callContainer（无需合法域名）。 */
const useCloud = !!CLOUD_ENV && !!wxApi?.cloud?.callContainer
let cloudReady = false
function ensureCloud() {
  if (cloudReady) return
  cloudReady = true
  try { wxApi?.cloud?.init?.({ env: CLOUD_ENV }) } catch { /* 云开发未初始化时由 callContainer 自身报错 */ }
}

/** 会话 Cookie：小程序端手动保存与携带（wx.request 不会自动跨启动保留）。 */
const COOKIE_KEY = 'yican_cookie'
let memoryCookie: string | null = null

function loadCookie(): string | null {
  if (memoryCookie !== null) return memoryCookie
  try {
    memoryCookie = (uni.getStorageSync(COOKIE_KEY) as string) || null
  } catch {
    memoryCookie = null
  }
  return memoryCookie
}

function saveCookie(cookie: string | null) {
  memoryCookie = cookie
  try {
    if (cookie) uni.setStorageSync(COOKIE_KEY, cookie)
    else uni.removeStorageSync(COOKIE_KEY)
  } catch {
    /* 存储失败时仅保留内存态 */
  }
}

/** 从 set-cookie 头里取出 yican_session（含清除场景的空值）。 */
function absorbSetCookie(raw: unknown) {
  if (!raw) return
  const list = Array.isArray(raw) ? raw : String(raw).split('\n')
  for (const item of list) {
    const pair = String(item).split(';')[0]
    if (pair.trim().startsWith('yican_session=')) {
      const value = pair.trim().slice('yican_session='.length)
      saveCookie(value ? pair.trim() : null)
    }
  }
}

class MiniResponse {
  ok: boolean
  status: number
  private headersMap: Map<string, string>
  constructor(status: number, headers: Record<string, string>) {
    this.status = status
    this.ok = status >= 200 && status < 300
    this.headersMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]))
  }
  headers = {
    has: (key: string) => this.headersMap.has(key.toLowerCase()),
    get: (key: string) => this.headersMap.get(key.toLowerCase()) ?? null,
  }
}

export interface JsonResponse<T = any> {
  response: MiniResponse
  body: T
}

/** 对齐浏览器 fetch 的调用形态；url 支持相对路径（自动拼 API_BASE）。 */
export async function requestJson<T = any>(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {},
  timeoutMs: number
): Promise<JsonResponse<T>> {
  const headers: Record<string, string> = { ...(init.headers ?? {}) }
  const cookie = loadCookie()
  if (cookie) headers.Cookie = cookie

  let result: { statusCode: number; header: Record<string, any>; data: any }
  try {
    if (useCloud) {
      ensureCloud()
      const path = url.startsWith('http') ? new URL(url).pathname + new URL(url).search : url
      result = await new Promise((resolve, reject) => {
        wxApi!.cloud!.callContainer({
          config: { env: CLOUD_ENV, service: CLOUD_SERVICE },
          path,
          method: (init.method as any) || 'GET',
          data: init.body ?? undefined,
          header: { ...headers, 'X-WX-SERVICE': CLOUD_SERVICE },
          timeout: Math.min(timeoutMs, 14000),
          success: resolve,
          fail: (error: unknown) => reject(error),
        })
      })
    } else {
      const absolute = url.startsWith('http') ? url : API_BASE + url
      result = await new Promise((resolve, reject) => {
        uni.request({
          url: absolute,
          method: (init.method as any) || 'GET',
          data: init.body ?? undefined,
          header: headers,
          timeout: timeoutMs,
          responseType: 'text',
          success: resolve,
          fail: () => reject(new Error('network')),
        })
      })
    }
  } catch {
    throw new Error('暂时连接不到厨房，请确认服务正在运行')
  }

  absorbSetCookie(result.header?.['set-cookie'] ?? result.header?.['Set-Cookie'])
  const responseHeaders: Record<string, string> = {}
  for (const [k, v] of Object.entries(result.header ?? {})) responseHeaders[k] = String(v)
  let body = result.data
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      /* 保留原始字符串 */
    }
  }
  if (body == null) body = {}
  // callContainer 可能不透传 set-cookie：响应体带 token 时同样落盘。
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'token')) {
    saveCookie((body as { token?: string }).token ? `yican_session=${(body as { token?: string }).token}` : null)
  }
  return { response: new MiniResponse(result.statusCode, responseHeaders), body: body as T }
}

export function clearSessionCookie() {
  saveCookie(null)
}
