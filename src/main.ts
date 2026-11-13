import { createSSRApp } from 'vue'
import App from './App.vue'
import './style.css'
import './mobile-warm.css'
import './form-controls.css'
import './reviews.css'
import './themes.css'
import './journal.css'
import './account.css'
import './polish.css'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
