<template>
  <div class="dash-shell flex">
    <aside class="dash-aside hidden lg:flex w-72 shrink-0 flex-col p-6">
      <router-link to="/" class="mb-8">
        <span class="block text-xs tracking-[0.18em] text-[#00E5FF]">IMEN MAHDI</span>
        <span class="block text-lg font-semibold mt-2">داشبورد کنترل</span>
      </router-link>
      <p class="dash-live mb-6">سیستم فعال</p>
      <nav class="flex flex-col gap-1">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="dash-nav-link"
          :class="{ 'is-active': isActive(link) }"
        >
          <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
          {{ link.label }}
        </router-link>
      </nav>
      <button class="mt-auto btn btn-ghost" type="button" @click="logout">خروج</button>
    </aside>

    <div class="flex-1 min-w-0">
      <header class="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[#2C2C2E] bg-[#1E1E1E] px-4 py-3">
        <button class="btn btn-ghost min-h-10 px-3 text-sm" type="button" :aria-expanded="open" @click="open = true">
          منو
        </button>
        <span class="font-semibold">داشبورد</span>
        <router-link to="/" class="text-sm text-[#98989D]">فروشگاه</router-link>
      </header>

      <button
        v-if="open"
        class="dash-drawer-backdrop lg:hidden"
        type="button"
        aria-label="بستن منو"
        @click="open = false"
      />
      <aside class="dash-drawer lg:hidden" :class="{ 'is-open': open }" :aria-hidden="!open" :inert="!open">
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-xs tracking-[0.18em] text-[#00E5FF]">IMEN MAHDI</p>
            <p class="font-semibold mt-1">داشبورد کنترل</p>
          </div>
          <button class="btn btn-ghost min-h-10 px-3 text-sm" type="button" @click="open = false">بستن</button>
        </div>
        <p class="dash-live mb-4">سیستم فعال</p>
        <nav class="flex flex-col gap-1 overflow-y-auto">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="dash-nav-link"
            :class="{ 'is-active': isActive(link) }"
            @click="open = false"
          >
            <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
            {{ link.label }}
          </router-link>
        </nav>
        <button class="mt-auto btn btn-ghost" type="button" @click="logout">خروج</button>
      </aside>

      <main class="p-3 sm:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@/assets/dashboard.css'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const open = ref(false)

const links = computed(() => {
  const base = [
    { to: '/dashboard', label: 'نمای کلی', icon: 'fa-bolt', exact: true },
    { to: '/account/orders', label: 'سفارش‌های من', icon: 'fa-bag-shopping' },
    { to: '/account/profile', label: 'پروفایل و آدرس', icon: 'fa-user' },
  ]
  if (auth.isAdmin) {
    base.push(
      { to: '/dashboard/admin/products', label: 'محصولات', icon: 'fa-boxes-stacked' },
      { to: '/dashboard/admin/orders', label: 'لیست سفارش‌ها', icon: 'fa-list' },
      { to: '/dashboard/admin/receipts', label: 'بررسی رسیدها', icon: 'fa-receipt' },
      { to: '/dashboard/admin/hero', label: 'هیرو صفحه اصلی', icon: 'fa-image' },
      { to: '/dashboard/admin/guarantee', label: 'ارسال سریع صفحه اصلی', icon: 'fa-truck-fast' },
      { to: '/dashboard/admin/shipping', label: 'قیمت ارسال تهران', icon: 'fa-motorcycle' },
      { to: '/dashboard/admin/leads', label: 'شماره‌های تماس', icon: 'fa-phone' },
      { to: '/dashboard/admin/reviews', label: 'نظر خریداران', icon: 'fa-star' },
      { to: '/dashboard/admin/sms', label: 'پیامک‌های خودکار', icon: 'fa-comment-sms' },
    )
  }
  return base
})

watch(open, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

function onKey(event) {
  if (event.key === 'Escape') open.value = false
}

watch(
  () => route.path,
  () => {
    open.value = false
  },
)

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey)
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})

function isActive(link) {
  if (link.exact) return route.path === link.to
  return route.path === link.to || route.path.startsWith(`${link.to}/`)
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>
