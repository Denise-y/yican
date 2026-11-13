<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ArrowUpRight from './icons/ArrowUpRight.vue'
import BookHeart from './icons/BookHeart.vue'
import CalendarDays from './icons/CalendarDays.vue'
import Check from './icons/Check.vue'
import ChevronLeft from './icons/ChevronLeft.vue'
import ChevronRight from './icons/ChevronRight.vue'
import Heart from './icons/Heart.vue'
import Utensils from './icons/Utensils.vue'
import { dateKey, people, type Recipe, type State } from '../domain'
import { monthCells } from '../preferences'
import { mealJournal, journalMonthSummary } from '../journal'
import FoodArt from './FoodArt.vue'
import ReviewFeed from './ReviewFeed.vue'

const props = defineProps<{ state:State; kitchenId:string; person:string; now:number }>()
const emit = defineEmits<{ recipe:[recipe:Recipe]; review:[mealId:string] }>()
const entries = computed(() => mealJournal(props.state, props.kitchenId, props.person, props.now))
const today = computed(() => dateKey(new Date(props.now)))
const initialDate = () => entries.value.at(-1)?.meal.date ?? today.value
const month = ref(initialDate().slice(0,7)), selectedDate = ref(initialDate())
const maxMonth = computed(() => [today.value.slice(0,7), entries.value.at(-1)?.meal.date.slice(0,7) ?? ''].sort().at(-1)!)
const cells = computed(() => monthCells(month.value))
const heading = computed(() => { const [y,m] = month.value.split('-'); return `${y} 年 ${Number(m)} 月` })
const summary = computed(() => journalMonthSummary(entries.value, month.value))
const byDate = computed(() => {
  const result = new Map<string, typeof entries.value>()
  for (const entry of entries.value) {
    const list = result.get(entry.meal.date) ?? []
    list.push(entry); result.set(entry.meal.date, list)
  }
  return result
})
const dayEntries = computed(() => byDate.value.get(selectedDate.value) ?? [])
const dateLabel = (date:string) => new Date(date+'T12:00:00').toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})
const timeLabel = (value:string) => new Date(value).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})
function cellLabel(date:string) {
  const list = byDate.value.get(date) ?? []
  return dateLabel(date) + (date===today.value?'，今天':'') + (list.length?`，${list.length} 餐，${list.filter(e=>e.confirmed).length} 餐已完成`:'，暂无用餐记录')
}
function moveMonth(delta:number) {
  const [y,m] = month.value.split('-').map(Number)
  month.value = dateKey(new Date(y,m-1+delta,1,12)).slice(0,7)
}
function reset() { selectedDate.value=initialDate(); month.value=selectedDate.value.slice(0,7) }
function thisMonth() { month.value=today.value.slice(0,7); selectedDate.value=today.value }
function changeMonth(event:Event) {
  const value=(event.target as HTMLInputElement).value
  if (/^\d{4}-\d{2}$/.test(value) && value<=maxMonth.value) month.value=value
}
watch(month, value => {
  selectedDate.value = entries.value.filter(e=>e.meal.date.startsWith(value+'-')).at(-1)?.meal.date ??
    (today.value.startsWith(value+'-')?today.value:value+'-01')
}, {flush:'sync'})
watch([()=>props.kitchenId,()=>props.person],reset)
</script>

<template>
  <section class="journal-page el-section">
    <header class="journal-heading el-header"><span class="eyebrow el-span">OUR TABLE, THROUGH THE SEASONS</span><h1 class="el-h1">日子有味，餐餐可忆。</h1><p class="el-p">翻一页日历，重温一餐一饭的烟火。</p><span class="journal-heading-art el-span" aria-hidden="true"><BookHeart :size="42" :stroke-width="1"/><i class="el-i"></i></span></header>
    <div class="journal-layout el-div">
      <section class="journal-calendar surface el-section" aria-label="用餐日志月历">
        <div class="journal-calendar-top el-div"><span class="el-span"><CalendarDays :size="16"/>餐桌日历</span><button class="text-button" @click="thisMonth">回到今天</button></div>
        <div class="journal-month-bar el-div"><button class="icon-btn" aria-label="日志上个月" @click="moveMonth(-1)"><ChevronLeft :size="20"/></button><label class="journal-month-picker"><b class="el-b">{{heading}}</b><input type="month" aria-label="选择日志月份" :value="month" min="1900-01" :max="maxMonth" @change="changeMonth"><span class="sr-only el-span">选择月份</span></label><button class="icon-btn" aria-label="日志下个月" :disabled="month>=maxMonth" @click="moveMonth(1)"><ChevronRight :size="20"/></button></div>
        <div class="journal-stats el-div"><span class="el-span"><b class="el-b">{{summary.days}}</b>天有记录</span><span class="el-span"><b class="el-b">{{summary.meals}}</b>餐记录</span><span class="el-span"><b class="el-b">{{summary.dishes}}</b>道菜留存</span></div>
        <div class="calendar-week el-div"><span v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="el-span">{{d}}</span></div>
        <div class="journal-days el-div"><template v-for="(date,index) in cells" :key="date??'blank-'+index"><button v-if="date" :class="{selected:selectedDate===date,today:date===today,recorded:byDate.has(date),future:date>today}" :aria-label="cellLabel(date)" :aria-pressed="selectedDate===date" @click="selectedDate=date"><span class="el-span">{{Number(date.slice(-2))}}</span><span class="journal-day-marks el-span" aria-hidden="true"><i v-for="entry in (byDate.get(date)??[]).slice(0,3)" :key="entry.meal.id" class="el-i" :class="{confirmed:entry.confirmed}"></i></span></button><span v-else class="el-span"></span></template></div>
        <div class="journal-legend el-div"><span class="el-span"><i class="confirmed el-i"></i>已完成</span><span class="el-span"><i class="el-i"></i>历史点菜</span><span class="journal-today-key el-span">描边为今天</span></div>
        <p class="journal-month-note el-p" aria-live="polite">{{summary.meals?'有标记的日子，藏着我们的家常滋味。':'这个月还没有留下用餐记录。'}}<button v-if="!summary.meals&&entries.length" class="text-button" @click="reset">去最近一餐<ChevronRight :size="14"/></button></p>
      </section>
      <section class="journal-day-detail el-section" aria-label="当日菜单" aria-live="polite">
        <header class="journal-day-heading el-header"><div class="el-div"><span class="eyebrow el-span">A DAY AT OUR TABLE</span><h2 class="el-h2">{{dateLabel(selectedDate)}}</h2></div><span v-if="dayEntries.length" class="badge soft el-span">{{dayEntries.length}} 餐</span></header>
        <article v-for="entry in dayEntries" :key="entry.meal.id" class="journal-meal surface el-article">
          <header class="journal-meal-heading el-header"><span class="journal-meal-icon el-span"><Utensils :size="21" :stroke-width="1.5"/></span><div class="el-div"><h3 class="el-h3">{{entry.meal.name}}</h3><p class="el-p">{{timeLabel(entry.meal.startsAt)}} · {{new Set(entry.orders.map(o=>o.userId)).size}} 人点菜 · {{entry.dishes.length}} 道菜</p></div><span class="journal-meal-status el-span" :class="{confirmed:entry.confirmed}"><Check v-if="entry.confirmed" :size="12"/>{{entry.confirmed?'已完成':'历史点菜'}}</span></header>
          <div class="journal-dishes el-div"><button v-for="dish in entry.dishes" :key="dish.id" :disabled="!dish.recipe" :aria-label="'查看当日菜谱：'+(dish.recipe?.name??'菜谱缺失')" @click="dish.recipe&&emit('recipe',dish.recipe)"><span class="journal-food el-span"><FoodArt :kind="dish.recipe?.art"/></span><span class="el-span"><b class="el-b">{{dish.recipe?.name??'菜谱已不可用'}}</b><small class="el-small">{{dish.portions}} 份<span v-if="dish.recipe" class="el-span"> · {{dish.recipe.category}}</span></small></span><ArrowUpRight v-if="dish.recipe" :size="16"/></button></div>
          <div v-if="entry.orders.some(o=>o.note)" class="journal-notes el-div"><p v-for="order in entry.orders.filter(o=>o.note)" :key="order.id" class="el-p"><b class="el-b">{{people[order.userId]?.name??'家人'}}</b><span class="el-span">{{order.note}}</span></p></div>
          <p v-if="!entry.confirmed" class="journal-unconfirmed el-p">保留了当时的点菜菜单，主厨尚未标记完成。</p>
          <section v-if="entry.reviews.length" class="journal-reviews el-section"><div class="journal-reviews-heading el-div"><Heart :size="14"/>留在餐后的话<span class="el-span">{{entry.reviews.length}}</span></div><ReviewFeed :reviews="entry.reviews" :state="state" :person="person"/></section>
          <footer class="el-footer"><span class="el-span">菜单保留当时的菜谱版本</span><button class="text-button" @click="emit('review',entry.meal.id)">{{entry.reviews.length?'查看 / 补写评价':'留一句餐后感受'}}<ChevronRight :size="14"/></button></footer>
        </article>
        <div v-if="!dayEntries.length" class="journal-empty surface el-div"><span class="el-span"><BookHeart :size="36" :stroke-width="1.2"/></span><h3 class="el-h3">{{selectedDate>today?'期待下一餐的相聚':'这一天，留一点空白。'}}</h3><p class="el-p">{{selectedDate>today?'未来的菜单可以在点菜页安排，餐后再来回味。':'还没有用餐记录，试试日历上有标记的日期。'}}</p></div>
        <p class="journal-explanation el-p">仅收录有菜单且已完成或用餐时间已结束的餐次。<br class="el-br">空餐次、已取消餐次及待用餐安排不计入日志。</p>
      </section>
    </div>
  </section>
</template>
