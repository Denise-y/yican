<script setup lang="ts">
import { computed,ref,watch } from 'vue'
import ArrowRight from './icons/ArrowRight.vue'
import Check from './icons/Check.vue'
import ChefHat from './icons/ChefHat.vue'
import CookingPot from './icons/CookingPot.vue'
import Eye from './icons/Eye.vue'
import EyeOff from './icons/EyeOff.vue'
import KeyRound from './icons/KeyRound.vue'
import Leaf from './icons/Leaf.vue'
import ShieldCheck from './icons/ShieldCheck.vue'
import Utensils from './icons/Utensils.vue'
import { accountRequest,type Invitation } from '../account'
import YiCheck from './YiCheck.vue'
const props=defineProps<{firstAccount:boolean;legacySlots:{chef:boolean;diner:boolean};inviteId:string}>()
const emit=defineEmits<{authenticated:[]}>()
const mode=ref<'login'|'register'>(props.firstAccount?'register':'login'),passwordless=ref(false),showPassword=ref(false)
const username=ref(''),nickname=ref(''),identifier=ref(''),password=ref(''),confirmation=ref(''),role=ref<'chef'|'diner'>('diner'),adoptLegacy=ref(false)
const busy=ref(false),error=ref(''),invite=ref<Invitation|null>(null),inviteError=ref('')
const isRegister=computed(()=>mode.value==='register')
const legacyAvailable=computed(()=>props.firstAccount&&!props.inviteId&&props.legacySlots[role.value])
watch([mode,passwordless],()=>{error.value='';password.value='';confirmation.value=''})
watch(legacyAvailable,()=>{adoptLegacy.value=false})
watch(()=>props.inviteId,async id=>{invite.value=null;inviteError.value='';if(!id)return;try{invite.value=await accountRequest('/api/invites/'+encodeURIComponent(id))}catch(e){inviteError.value=(e as Error).message}},{immediate:true})
async function submit(){
  if(busy.value)return
  error.value=''
  if(isRegister.value&&!passwordless.value&&password.value!==confirmation.value){error.value='两次输入的密码不一致';return}
  busy.value=true
  try{
    await accountRequest('/api/auth/'+(isRegister.value?'register':'login'),isRegister.value?
      {username:username.value,nickname:nickname.value,password:password.value,passwordless:passwordless.value,role:role.value,adoptLegacy:adoptLegacy.value,inviteId:props.inviteId||undefined}:
      {identifier:identifier.value,password:password.value,passwordless:passwordless.value})
    emit('authenticated')
  }catch(e){error.value=(e as Error).message}finally{busy.value=false}
}
</script>
<template>
  <main class="auth-page el-main">
    <section class="auth-story el-section"><view class="auth-brand" @tap="() => {}"><span class="auth-brand-symbol el-span"><CookingPot :size="28" :stroke-width="1.5"/></span><span class="el-span">一餐<small class="el-small">YICAN · OUR EVERYDAY TABLE</small></span></view><div class="auth-story-copy el-div"><span class="eyebrow el-span">A PLACE AT OUR TABLE</span><h1 class="el-h1">有人掌勺，<br class="el-br">有人惦记。<span class="el-span">一餐，就有了家的味道。</span></h1><p class="el-p">把想吃的告诉彼此，把平凡的日子<br class="el-br">慢慢过成喜欢的样子。</p><div class="auth-table-art el-div" aria-hidden="true"><div class="auth-plate el-div"><Leaf :size="45" :stroke-width="1.1"/></div><span class="auth-table-fork el-span"></span><span class="auth-table-spoon el-span"></span><i class="el-i"></i></div></div><footer class="el-footer"><Leaf :size="15"/>一屋两人，三餐四季。</footer></section>
    <section class="auth-form-side el-section">
      <div class="auth-mobile-brand el-div"><CookingPot :size="23"/>一餐<span class="el-span">好好吃饭，好好相伴</span></div>
      <div class="auth-card el-div">
        <div v-if="invite" class="auth-invite-banner el-div"><Utensils :size="19"/><span class="el-span"><b class="el-b">{{invite.kitchenName}} 邀你入座</b><small class="el-small">{{invite.type==='temporary'?(invite.mealDate+' · '+invite.mealName):'长期相伴，一起好好吃饭'}} · 登录后即可加入</small></span></div>
        <p v-if="inviteError" class="auth-error el-p" role="alert">{{inviteError}}<text class="text-button">退出邀请，继续注册或登录</text></p>
        <span class="eyebrow el-span">{{isRegister?'MAKE YOURSELF AT HOME':'WELCOME BACK'}}</span>
        <h2 class="el-h2">{{isRegister?'给自己，留一个位置。':'回来啦，今天想吃什么？'}}</h2><p class="auth-subtitle el-p">{{isRegister?'从一个自己的账号，开始厨房里的日常。':'登录你的小厨房，继续一餐一饭的相伴。'}}</p>
        <div class="auth-tabs el-div" role="group" aria-label="登录或注册"><button :class="{active:!isRegister}" :aria-pressed="!isRegister" :disabled="busy" @click="mode='login'">登录</button><button :class="{active:isRegister}" :aria-pressed="isRegister" :disabled="busy" @click="mode='register'">注册账号</button></div>
        <form @submit.prevent="submit">
          <fieldset :disabled="busy" class="auth-fields el-fieldset">
            <template v-if="isRegister"><label class="form-field">账号<input v-model="username" required minlength="3" maxlength="32" pattern="[a-zA-Z0-9_.\-]{3,32}" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="取一个好记的账号，例如 kitchen_hao"><small class="el-small">3—32 位字母、数字、点、横线或下划线</small></label><label class="form-field">昵称<input v-model="nickname" required maxlength="18" autocomplete="nickname" placeholder="在餐桌旁，想让大家怎么称呼你？"></label></template>
            <label v-else class="form-field">账号或昵称<input v-model="identifier" required maxlength="64" autocomplete="username" autocapitalize="none" placeholder="输入你的账号或昵称"></label>
            <button type="button" class="auth-passwordless" :class="{selected:passwordless}" :aria-pressed="passwordless" @click="passwordless=!passwordless"><span class="auth-toggle-check el-span"><Check v-if="passwordless" :size="14"/></span><KeyRound :size="17"/><span class="el-span">{{isRegister?'使用免密码模式':'免密码登录'}}</span><small class="el-small">局域网便捷入口</small></button>
            <p v-if="passwordless" class="auth-mode-note el-p">{{isRegister?'开启后，知道你的账号或昵称的人都能进入此账号。适合信任的家人朋友；之后可在设置中启用密码。':'仅适用于已经开启免密码模式的账号，填写账号或昵称即可进入。'}}</p>
            <template v-else><label class="form-field">{{isRegister?'设置密码':'密码'}}<span class="auth-password-field el-span"><input v-model="password" :type="showPassword?'text':'password'" :autocomplete="isRegister?'new-password':'current-password'" required :minlength="isRegister?6:1" maxlength="128" :placeholder="isRegister?'至少 6 位，保护你的小厨房':'输入密码'"><button type="button" :aria-label="showPassword?'隐藏密码':'显示密码'" @click="showPassword=!showPassword"><EyeOff v-if="showPassword" :size="19"/><Eye v-else :size="19"/></button></span></label><label v-if="isRegister" class="form-field">确认密码<input v-model="confirmation" :type="showPassword?'text':'password'" autocomplete="new-password" required minlength="6" maxlength="128" placeholder="再输入一次密码"></label></template>
            <template v-if="isRegister"><label class="auth-role-label">你更喜欢怎样参与？<small class="el-small">加入厨房时还可以选择</small></label><div class="auth-roles el-div" role="group" aria-label="选择常用身份"><button type="button" :class="{selected:role==='chef'}" :aria-pressed="role==='chef'" @click="role='chef'"><ChefHat :size="23"/><b class="el-b">我来掌勺</b><small class="el-small">管理菜单，准备一餐</small></button><button type="button" :class="{selected:role==='diner'}" :aria-pressed="role==='diner'" @click="role='diner'"><Utensils :size="23"/><b class="el-b">我来点菜</b><small class="el-small">分享期待，认真品尝</small></button></div><label v-if="legacyAvailable" class="auth-legacy"><YiCheck v-model="adoptLegacy" /><span class="el-span">接续本机原有的{{role==='chef'?'主厨':'点菜主人'}}身份<small class="el-small">保留原厨房、历史点菜与评价；仅首次设置可用。</small></span></label></template>
            <p v-if="error" class="auth-error el-p" role="alert">{{error}}</p>
            <button class="btn primary full auth-submit" form-type="submit">{{busy?'正在准备…':isRegister?'注册，开启烟火日常':'登录，回到小厨房'}}<ArrowRight :size="18"/></button>
          </fieldset>
        </form>
        <p class="auth-local-note el-p"><ShieldCheck :size="14"/>账号与厨房数据保存在这台电脑的数据库中</p>
      </div>
      <p class="auth-bottom-note el-p">好好吃饭，好好相伴。<span class="el-span">MADE WITH A LITTLE LOVE</span></p>
    </section>
  </main>
</template>
