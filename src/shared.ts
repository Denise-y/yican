import { ref } from 'vue'
import type { State } from './domain'
import { applyStateChange, type StateChange } from './sync'
import type { Command } from '../server/commands'
import { accountExpired } from './account'
import { people } from './domain'
import { requestJson } from './request'

export interface Snapshot {
  state?: State
  revision: number
  serverNow: number
  fromRevision?: number
  changes?: StateChange[]
  result?: Record<string, string>
}

/** 小程序替代 window.__YICAN_BOOT__：启动快照存放于模块内。 */
export const bootSnapshot = ref<Snapshot | null>(null)
/** 页面可见性（App onShow/onHide 驱动），替代 document.visibilitychange。 */
export const appVisibility = ref(true)
/** 欢迎页粘贴邀请码后传递给 AccountRoot（替代网页 hashchange）。 */
export const pendingInvite = ref('')
/** 生成邀请后待分享的邀请码（onShareAppMessage 读取）。 */
export const shareInvite = ref('')

export const lanEnabled = true
export const sharedStatus = ref<'connecting' | 'online' | 'offline'>(lanEnabled ? 'connecting' : 'online')
export const sharedBusy = ref(false)
export const serverOffset = ref(0)
export const fingerprint = (value: unknown) => (value == null ? null : JSON.stringify(value))

export function newId() {
  // 小程序环境无 crypto.getRandomValues，用 Math.random 生成 UUID v4 形态。
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const s = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
}

async function request(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
  const { response, body } = await requestJson(url, init ?? {}, 10000)
  if (response.headers.has('X-Server-Time')) body.serverNow = Number(response.headers.get('X-Server-Time'))
  if (!response.ok) {
    if (response.status === 401) accountExpired.value = true
    const error = new Error(body.error || '服务请求失败') as Error & { status?: number }
    error.status = response.status
    throw error
  }
  return body as Snapshot
}

export async function bootstrap() {
  if (!lanEnabled) return
  bootSnapshot.value = await request('/api/state')
  Object.assign(people, bootSnapshot.value.state?.people ?? {})
  sharedStatus.value = 'online'
  serverOffset.value = bootSnapshot.value.serverNow - Date.now()
}

export function connectShared(state: State) {
  let revision = bootSnapshot.value?.revision || 0
  let reading = false
  let stopped = false
  const requests = new Map<string, string>()
  const receive = (snapshot: Snapshot) => {
    serverOffset.value = snapshot.serverNow - Date.now()
    if (snapshot.state || snapshot.revision > revision) {
      Object.assign(people, snapshot.state?.people ?? {})
      if (snapshot.state) Object.assign(state, snapshot.state)
      else if (snapshot.fromRevision === revision && snapshot.changes)
        for (const change of snapshot.changes) applyStateChange(state, change)
      else return false
      revision = snapshot.revision
    }
    sharedStatus.value = 'online'
    return true
  }
  const refresh = async () => {
    if (!lanEnabled || reading || sharedBusy.value || stopped || !appVisibility.value) return
    reading = true
    try {
      if (!receive(await request('/api/state?since=' + revision))) receive(await request('/api/state'))
    } catch {
      sharedStatus.value = 'offline'
    } finally {
      reading = false
    }
  }
  const timer = lanEnabled ? setInterval(refresh, 2000) : undefined
  return {
    refresh,
    async send(actor: string, command: Command) {
      if (sharedBusy.value) throw new Error('上一项操作正在保存，请稍候')
      const key = JSON.stringify({ actor, command })
      const requestId = requests.get(key) || newId()
      requests.set(key, requestId)
      sharedBusy.value = true
      try {
        const snapshot = await request('/api/commands?since=' + revision, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Yican-Request': '1' },
          body: JSON.stringify({ requestId, actor, command }),
        })
        if (!receive(snapshot)) receive(await request('/api/state'))
        requests.delete(key)
        return snapshot.result || {}
      } catch (error) {
        const e = error as Error & { status?: number }
        if (e.status) {
          requests.delete(key)
          throw e
        }
        sharedStatus.value = 'offline'
        throw new Error('连接中断，保存结果尚未确认。输入已保留，请恢复连接后重试。')
      } finally {
        sharedBusy.value = false
        void refresh()
      }
    },
    stop() {
      stopped = true
      clearInterval(timer)
    },
  }
}
