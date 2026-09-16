<template>
  <div class="dash-shell flex">
    <aside class="dash-aside hidden lg:flex w-72 shrink-0 flex-col p-5">
      <router-link to="/" class="mb-6 flex items-center gap-3 px-2">
        <span class="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]">
          <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
        </span>
        <span>
          <span class="block text-[11px] font-bold text-[var(--dash-primary)]">IMEN YAB</span>
          <span class="block text-base font-extrabold mt-0.5">داشبورد فروش</span>
        </span>
      </router-link>

      <nav class="flex flex-col gap-0.5 overflow-y-auto pb-4 flex-1 min-h-0">
        <template v-for="group in navGroups" :key="group.title">
          <p v-if="group.title" class="dash-nav-group">{{ group.title }}</p>
          <router-link
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            class="dash-nav-link"
            :class="{ 'is-active': isActive(link) }"
          >
            <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
            {{ link.label }}
          </router-link>
        </template>
      </nav>

      <button class="mt-auto btn btn-ghost shrink-0" type="button" @click="logout">خروج از حساب</button>
    </aside>

    <div class="flex-1 min-w-0">
      <header
        class="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--dash-line)] bg-white px-3 py-2.5"
      >
        <button
          ref="menuBtn"
          id="dash-menu-btn"
          class="dash-icon-btn"
          type="button"
          aria-label="باز کردن منو"
          :aria-expanded="open"
          aria-controls="dash-mobile-nav"
          @click="openDrawer"
        >
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
        <div class="min-w-0 flex-1 text-center">
          <p class="text-[11px] text-[var(--dash-muted)] leading-none">داشبورد</p>
          <p class="font-extrabold text-sm truncate mt-1">{{ currentPageTitle }}</p>
        </div>
        <router-link to="/" class="dash-icon-btn text-[var(--dash-muted)]" aria-label="بازگشت به فروشگاه">
          <i class="fa-solid fa-store" aria-hidden="true"></i>
        </router-link>
      </header>

      <button
        v-if="open"
        class="dash-drawer-backdrop lg:hidden"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        @click="closeDrawer"
      />
      <aside
        id="dash-mobile-nav"
        ref="drawerRef"
        class="dash-drawer lg:hidden"
        :class="{ 'is-open': open }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dash-drawer-title"
        :aria-hidden="!open"
        :inert="!open"
      >
        <div class="flex items-center justify-between mb-4 shrink-0">
          <div>
            <p class="text-[11px] font-bold text-[var(--dash-primary)]">IMEN YAB</p>
            <p id="dash-drawer-title" class="font-extrabold mt-1">داشبورد فروش</p>
          </div>
          <button
            ref="closeBtn"
            class="dash-icon-btn"
            type="button"
            aria-label="بستن منو"
            @click="closeDrawer"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <nav class="dash-drawer__nav" aria-label="منوی داشبورد">
          <p class="dash-nav-group">دسترسی سریع</p>
          <router-link
            v-for="link in primaryLinks"
            :key="`p-${link.to}`"
            :to="link.to"
            class="dash-nav-link"
            :class="{ 'is-active': isActive(link) }"
            @click="closeDrawer"
          >
            <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
            {{ link.label }}
          </router-link>

          <template v-if="moreGroups.length">
            <button
              class="dash-more-toggle"
              type="button"
              :aria-expanded="moreOpen"
              @click="moreOpen = !moreOpen"
            >
              <span>بیشتر</span>
              <i :class="['fa-solid', moreOpen ? 'fa-chevron-up' : 'fa-chevron-down']" aria-hidden="true"></i>
            </button>
            <div v-show="moreOpen" class="dash-more-panel">
              <template v-for="group in moreGroups" :key="`m-${group.title}`">
                <p v-if="group.title" class="dash-nav-group">{{ group.title }}</p>
                <router-link
                  v-for="link in group.links"
                  :key="link.to"
                  :to="link.to"
                  class="dash-nav-link"
                  :class="{ 'is-active': isActive(link) }"
                  @click="closeDrawer"
                >
                  <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
                  {{ link.label }}
                </router-link>
              </template>
            </div>
          </template>
        </nav>

        <button class="dash-drawer__logout btn btn-ghost shrink-0" type="button" @click="logout">
          خروج از حساب
        </button>
      </aside>

      <main class="p-4 sm:p-7 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import '@fontsource/jetbrains-mono/700.css'
import '@/assets/dashboard.css'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const open = ref(false)
const moreOpen = ref(false)
const menuBtn = ref(null)
const closeBtn = ref(null)
const drawerRef = ref(null)

const PRIMARY_PATHS = new Set([
  '/dashboard',
  '/dashboard/admin/orders',
  '/dashboard/admin/receipts',
  '/dashboard/admin/products',
  '/account/orders',
  '/account/profile',
])

const navGroups = computed(() => {
  if (!auth.isAdmin) {
    return [
      {
        title: '',
        links: [
          { to: '/dashboard', label: 'نمای کلی', icon: 'fa-chart-line', exact: true },
          { to: '/account/orders', label: 'سفارش‌های من', icon: 'fa-bag-shopping' },
          { to: '/account/profile', label: 'پروفایل و آدرس', icon: 'fa-user' },
        ],
      },
    ]
  }

  return [
    {
      title: 'مدیریت فروش',
      links: [
        { to: '/dashboard', label: 'داشبورد', icon: 'fa-chart-pie', exact: true },
        { to: '/dashboard/admin/orders', label: 'مدیریت سفارش‌ها', icon: 'fa-clipboard-list' },
        { to: '/dashboard/admin/receipts', label: 'بررسی رسیدها', icon: 'fa-receipt' },
        { to: '/dashboard/admin/leads', label: 'مخاطبین / سرنخ‌ها', icon: 'fa-users' },
        { to: '/dashboard/admin/shipping', label: 'نوع ارسال', icon: 'fa-truck' },
      ],
    },
    {
      title: 'محصولات',
      links: [
        { to: '/dashboard/admin/products', label: 'لیست محصولات', icon: 'fa-boxes-stacked' },
        { to: '/dashboard/admin/reviews', label: 'نظر خریداران', icon: 'fa-star' },
      ],
    },
    {
      title: 'محتوای فروشگاه',
      links: [
        { to: '/dashboard/admin/hero', label: 'هیرو صفحه اصلی', icon: 'fa-image' },
        { to: '/dashboard/admin/guarantee', label: 'بخش ارسال سریع', icon: 'fa-truck-fast' },
      ],
    },
    {
      title: 'ادمین',
      links: [
        { to: '/dashboard/admin/sms', label: 'پیامک خودکار', icon: 'fa-comment-sms' },
        { to: '/dashboard/admin/settings', label: 'تنظیمات ورود', icon: 'fa-gear' },
        { to: '/account/profile', label: 'پروفایل ادمین', icon: 'fa-user-shield' },
      ],
    },
  ]
})

const flatLinks = computed(() => navGroups.value.flatMap((group) => group.links))

const primaryLinks = computed(() => {
  if (!auth.isAdmin) return flatLinks.value
  return flatLinks.value.filter((link) => PRIMARY_PATHS.has(link.to) && link.to !== '/account/profile')
})

const moreGroups = computed(() => {
  if (!auth.isAdmin) return []
  const primary = new Set(primaryLinks.value.map((link) => link.to))
  return navGroups.value
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => !primary.has(link.to)),
    }))
    .filter((group) => group.links.length)
})

const currentPageTitle = computed(() => {
  const match = flatLinks.value.find((link) => isActive(link))
  return match?.label || 'داشبورد'
})

const activeInMore = computed(() =>
  moreGroups.value.some((group) => group.links.some((link) => isActive(link))),
)

watch(
  () => [route.path, activeInMore.value],
  () => {
    if (activeInMore.value) moreOpen.value = true
  },
  { immediate: true },
)

watch(open, async (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
  if (value) {
    if (activeInMore.value) moreOpen.value = true
    await nextTick()
    closeBtn.value?.focus()
  } else {
    await nextTick()
    menuBtn.value?.focus()
  }
})

watch(
  () => route.path,
  () => {
    open.value = false
  },
)

function openDrawer() {
  open.value = true
}

function closeDrawer() {
  open.value = false
}

function getFocusable() {
  if (!drawerRef.value) return []
  return [...drawerRef.value.querySelectorAll('a[href], button:not([disabled])')].filter(
    (el) => !el.disabled && el.getClientRects().length > 0,
  )
}

function onKey(event) {
  if (!open.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDrawer()
    return
  }

  if (event.key !== 'Tab') return

  const list = getFocusable()
  if (!list.length) return

  const first = list[0]
  const last = list[list.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

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
