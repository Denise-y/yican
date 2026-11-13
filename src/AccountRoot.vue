<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CookingPot from './components/icons/CookingPot.vue'
import RotateCcw from './components/icons/RotateCcw.vue'
import MainView from './MainView.vue'
import AuthScreen from './components/AuthScreen.vue'
import InviteLanding from './components/InviteLanding.vue'
import { account, accountExpired, accountRequest } from './account'
import { bootstrap, pendingInvite } from './shared'

const loading = ref(true), ready = ref(false), error = ref(''), firstAccount = ref(false), legacySlots = ref({ chef: false, diner: false })

/** 小程序通过启动参数/分享路径携带邀请码（替代网页 location.hash）。 */
function launchInviteId(): string {
  try {
    const options = uni.getLaunchOptionsSync()?.query ?? {}
    return (options.invite as string) || ''
  } catch {
    return ''
  }
}
const inviteId = ref(launchInviteId())

async function load() {
  loading.value = true
  error.value = ''
  ready.value = false
  try {
    const result = await accountRequest<{ user: typeof account.value; firstAccount: boolean; legacySlots: typeof legacySlots.value }>(
      '/api/auth/me'
    )
    account.value = result.user
    firstAccount.value = result.firstAccount
    legacySlots.value = result.legacySlots
    if (account.value) {
      await bootstrap()
      ready.value = true
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function authenticated() {
  accountExpired.value = false
  await load()
}
async function joined() {
  inviteId.value = ''
  await load()
}
function later() {
  inviteId.value = ''
}

watch(accountExpired, (expired) => {
  if (expired) {
    ready.value = false
    account.value = null
    void load()
  }
})
watch(pendingInvite, (id) => {
  if (id) {
    inviteId.value = id
    pendingInvite.value = ''
  }
})
onMounted(() => {
  void load()
})
</script>

<template>
  <view v-if="loading || error" class="account-loading">
    <view class="auth-brand-symbol"><CookingPot :size="30" /></view>
    <h1 class="el-h1">一餐</h1>
    <p role="status" class="el-p">{{ error || '把厨房准备好，等你入座…' }}</p>
    <button v-if="error" class="btn primary" @click="load"><RotateCcw :size="16" />重新连接</button>
  </view>
  <AuthScreen
    v-else-if="!account"
    :first-account="firstAccount"
    :legacy-slots="legacySlots"
    :invite-id="inviteId"
    @authenticated="authenticated"
  />
  <InviteLanding v-else-if="inviteId && ready" :key="inviteId" :invite-id="inviteId" @joined="joined" @later="later" />
  <MainView v-else-if="ready" />
</template>
