import fs from 'node:fs'
let a = fs.readFileSync('D:/yican-miniprogram/src/MainView.vue', 'utf8')
a = a.replace(':class="{red:s.amount===0,amber:s.amount===null} el-p"', 'class="el-p" :class="{red:s.amount===0,amber:s.amount===null}"')
fs.writeFileSync('D:/yican-miniprogram/src/MainView.vue', a)
let b = fs.readFileSync('D:/yican-miniprogram/src/components/MealJournal.vue', 'utf8')
b = b.replace(':class="{confirmed:entry.confirmed} el-i"', 'class="el-i" :class="{confirmed:entry.confirmed}"')
fs.writeFileSync('D:/yican-miniprogram/src/components/MealJournal.vue', b)
console.log('fixed 2 dynamic-class bindings')
