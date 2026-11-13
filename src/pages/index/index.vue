<script setup lang="ts">
import { onShareAppMessage } from '@dcloudio/uni-app'
import AccountRoot from '../../AccountRoot.vue'
import { initTheme, themeVars } from '../../themes'
import { shareInvite } from '../../shared'

initTheme()

onShareAppMessage(() => ({
  title: '来我家，好好吃一餐。',
  path: shareInvite.value ? `pages/index/index?invite=${shareInvite.value}` : 'pages/index/index',
}))
</script>

<template>
  <view class="page-scope theme-scope" :style="themeVars">
    <AccountRoot />
  </view>
</template>

<style>
.page-scope {
  min-height: 100vh;
}
</style>
