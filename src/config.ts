/**
 * 后端 API 地址配置。
 * - 本地开发（微信开发者工具）：默认 http://127.0.0.1:3000
 * - 真机局域网调试：改成电脑局域网 IP，如 http://172.19.102.166:3000
 * - 正式发布：改成微信云托管的默认域名，如 https://xxx.ap-xxx.run.tcloudbase.com
 * 也可通过环境变量 VITE_API_BASE 覆盖（.env 文件）。
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) || 'http://127.0.0.1:3000'
