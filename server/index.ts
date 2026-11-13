import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { networkInterfaces } from 'node:os'
import { Store } from './store'
import { createAppServer } from './http'
import { initializeBundledCatalog } from './bundled-catalog'
import { restoreDatabase, createBackupScheduler } from './cos-backup'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const dbPath=resolve(process.env.YICAN_DATA_DIR||resolve(root,'data'),'kitchen.sqlite')
await restoreDatabase(dbPath)
const store=new Store(dbPath,{seedDemo:false})
const backups=createBackupScheduler(dbPath,target=>store.db.prepare('VACUUM INTO ?').run(target))
try {
 const imported=initializeBundledCatalog(store)
 if(imported)console.log(`内置 HowToCook 菜谱已就绪：${imported.total} 道，新增 ${imported.added} 道。`)
} catch(error){store.close();throw error}
const port=Number(process.env.YICAN_PORT||3000)
const host=process.env.YICAN_HOST||'127.0.0.1'
let available=process.env.YICAN_MANAGED!=='1'
const server=createAppServer(store,resolve(root,'dist'),()=>available,resolve(root,'public'),()=>backups.note())
server.on('error',error=>{console.error('启动失败：',error.message);store.close();process.exit(1)})
server.listen({port,host,backlog:4096},()=>{
 if(process.send)process.send({type:'ready',port:(server.address() as {port:number}).port})
 console.log(`一餐${host==='127.0.0.1'?'本机':'共享'}服务已启动： http://127.0.0.1:${port}`)
 if(host==='0.0.0.0')for(const addresses of Object.values(networkInterfaces()))for(const address of addresses||[])if(address.family==='IPv4'&&!address.internal)console.log(`局域网地址：http://${address.address}:${port}`)
 console.log(`数据库：${resolve(process.env.YICAN_DATA_DIR||resolve(root,'data'),'kitchen.sqlite')}\n保留本窗口运行；按 Ctrl+C 停止。打开网页注册或登录，使用邀请链接加入厨房。`)
})
let stopping=false
async function shutdown(){if(stopping)return;stopping=true
 try{await backups.flush()}catch(error){console.error('关机前备份失败：',error)}
 server.close(()=>{store.close();process.exit(0)});server.closeIdleConnections()
 setTimeout(()=>process.exit(0),8000).unref()
}
process.on('message',message=>{
 if(message==='activate'){available=true;process.send?.({type:'active'})}
 if(message==='shutdown')shutdown()
})
// A managed child must not outlive its controller or keep a database open during recovery.
if(process.env.YICAN_MANAGED==='1')process.on('disconnect',shutdown)
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,shutdown)
