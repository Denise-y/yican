export const githubIssuesUrl = 'https://github.com/a92063256/yican-tingtingcook/issues'
export const githubCheckTimeoutMs = 5000

/** 检查当前网络能否到达 GitHub；小程序端用 uni.request 探测。 */
export async function canReachGithub(): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }
    const timer = setTimeout(() => done(false), githubCheckTimeoutMs)
    uni.request({
      url: githubIssuesUrl,
      method: 'HEAD',
      timeout: githubCheckTimeoutMs,
      success: () => {
        clearTimeout(timer)
        done(true)
      },
      fail: () => {
        clearTimeout(timer)
        done(false)
      },
    })
  })
}
