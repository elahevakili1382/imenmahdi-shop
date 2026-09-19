import '@fontsource-variable/vazirmatn/wght.css'
import './assets/tailwind.css'
import './assets/main.css'
import 'primeicons/primeicons.css'
import 'swiper/css'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
import '@fortawesome/fontawesome-free/css/regular.min.css'
import '@fortawesome/fontawesome-free/css/brands.min.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from 'motion-v'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fadeUp = reduceMotion
  ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
  : {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      inViewOptions: { once: true, margin: '-10% 0px' },
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    }

app.use(createPinia())
app.use(MotionPlugin, {
  presets: {
    'fade-up': fadeUp,
    'fade-in': reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          inViewOptions: { once: true },
          transition: { duration: 0.35 },
        },
  },
})
app.use(Toast, {
  position: 'top-right',
  timeout: 3200,
  closeOnClick: true,
  icon: true,
  rtl: true,
  hideProgressBar: true,
  transition: 'imen-toast-soft',
  toastClassName: 'imen-toast',
  bodyClassName: 'imen-toast__body',
  closeButtonClassName: 'imen-toast__close',
})
app.use(router)

app.mount('#app')
