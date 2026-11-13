<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { appVisibility } from './shared'

onLaunch(() => {
  // 小程序启动即视为可见，触发一次状态刷新
  appVisibility.value = true
})
onShow(() => {
  appVisibility.value = true
})
onHide(() => {
  appVisibility.value = false
})
</script>

<style></style>
