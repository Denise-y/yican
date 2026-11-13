/**
 * 后端 API 地址配置。
 * - 本地开发（微信开发者工具）：默认 http://127.0.0.1:3000
 * - 真机局域网调试：改成电脑局域网 IP，如 http://172.19.102.166:3000
 * - 正式发布：改成微信云托管的默认域名，如 https://xxx.ap-xxx.run.tcloudbase.com
 * 也可通过环境变量 VITE_API_BASE 覆盖（.env 文件）。
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) || 'http://127.0.0.1:3000'

/** 封面图静态资源域名（生产指向对象存储；默认跟随 API_BASE 走本机/服务器）。 */
export const IMAGE_BASE: string = (import.meta.env.VITE_IMAGE_BASE as string | undefined) || API_BASE

/** 微信云托管：设置 VITE_CLOUD_ENV 后小程序端改走 wx.cloud.callContainer（免域名白名单）。 */
export const CLOUD_ENV: string | undefined = import.meta.env.VITE_CLOUD_ENV as string | undefined
export const CLOUD_SERVICE: string =
  (import.meta.env.VITE_CLOUD_SERVICE as string | undefined) || 'yican'
