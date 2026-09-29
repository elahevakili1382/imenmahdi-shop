<template>
  <div ref="headerWrap" class="navbar-wrap">
    <header
      ref="headerEl"
      class="navbar fixed inset-x-0 top-0 z-50 overflow-visible backdrop-blur-md transition-[transform,colors] duration-300"
      :class="[
        overlay
          ? 'border-b border-white/10 bg-night/70 text-stone'
          : 'border-b border-sand bg-stone/90 text-ink',
        navHidden ? '-translate-y-full' : 'translate-y-0',
      ]"
    >
      <div class="container-shop navbar-bar flex items-center gap-2 sm:gap-3 py-3 lg:gap-4 lg:py-3.5">
        <router-link to="/" class="navbar-brand shrink-0 leading-tight">
          <span class="block text-[10px] sm:text-[11px] tracking-[0.22em] text-ember">IMEN YAB</span>
          <span class="block font-extrabold text-lg sm:text-xl">ایمن یاب</span>
        </router-link>

        <form
          class="search-wrap flex min-w-0 flex-1 lg:hidden"
          @submit.prevent="search"
        >
          <div
            class="flex h-10 w-full items-stretch overflow-hidden rounded-full border"
            :class="overlay ? 'border-white/15 bg-white/10' : 'border-sand bg-bone'"
          >
            <label class="sr-only" for="site-search-mobile">جستجوی محصولات</label>
            <input
              id="site-search-mobile"
              v-model="query"
              type="search"
              placeholder="جستجو محصول..."
              class="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm"
              :class="overlay ? 'text-stone placeholder:text-white/45' : 'text-ink'"
              autocomplete="off"
              @focus="suggestOpen = true"
              @input="suggestOpen = true"
            />
            <button
              class="h-full shrink-0 px-3 text-sm font-semibold text-stone"
              :class="overlay ? 'bg-white/15' : 'bg-night'"
              type="submit"
              aria-label="جستجو"
            >
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </button>
          </div>
          <div v-if="showSuggest" class="search-suggest" role="listbox" aria-label="پیشنهاد محصولات">
            <router-link
              v-for="item in suggestions"
              :key="item.id"
              :to="`/products/${item.slug}`"
              class="search-suggest__item"
              role="option"
              @click="suggestOpen = false"
            >
              <img v-if="item.image" :src="asset(item.image)" alt="" />
              <span class="search-suggest__copy">
                <span>{{ item.title }}</span>
                <strong>{{ displayPrice(item) }}</strong>
              </span>
            </router-link>
            <p v-if="!suggestions.length" class="search-suggest__empty">کالایی با این نام در لیست نیست.</p>
            <button type="submit" class="search-suggest__all">مشاهده همه نتایج</button>
          </div>
        </form>

        <div class="search-wrap hidden lg:block flex-1 max-w-xl relative">
          <form
            class="flex h-11 w-full items-stretch overflow-hidden rounded-full border"
            :class="overlay ? 'border-white/15 bg-white/10' : 'border-sand bg-bone'"
            @submit.prevent="search"
          >
            <label class="sr-only" for="site-search">جستجوی محصولات</label>
            <input
              id="site-search"
              v-model="query"
              type="search"
              placeholder="جستجوی کلاه، ماسک، لباس آتش‌نشانی..."
              class="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-sm"
              :class="overlay ? 'text-stone placeholder:text-white/45' : 'text-ink'"
              autocomplete="off"
              @focus="suggestOpen = true"
              @input="suggestOpen = true"
            />
            <button
              class="h-full min-h-0 shrink-0 rounded-none px-5 text-sm font-semibold bg-night text-stone hover:bg-ink"
              type="submit"
            >
              جستجو
            </button>
          </form>
          <div v-if="showSuggest" class="search-suggest" role="listbox" aria-label="پیشنهاد محصولات">
            <router-link
              v-for="item in suggestions"
              :key="`d-${item.id}`"
              :to="`/products/${item.slug}`"
              class="search-suggest__item"
              role="option"
              @click="suggestOpen = false"
            >
              <img v-if="item.image" :src="asset(item.image)" alt="" />
              <span class="search-suggest__copy">
                <span>{{ item.title }}</span>
                <strong>{{ displayPrice(item) }}</strong>
              </span>
            </router-link>
            <p v-if="!suggestions.length" class="search-suggest__empty">کالایی با این نام در لیست نیست.</p>
            <button type="button" class="search-suggest__all" @click="search">مشاهده همه نتایج</button>
          </div>
        </div>

        <div class="ms-auto flex items-center gap-1">
          <div ref="accountRoot" class="relative z-[80] hidden shrink-0 lg:block">
            <button
              class="icon-btn"
              :class="{ 'is-overlay': overlay }"
              type="button"
              :aria-expanded="accountOpen"
              aria-controls="account-menu"
              aria-label="حساب کاربری"
              @click="accountOpen = !accountOpen"
            >
              <i class="fa-regular fa-user" aria-hidden="true"></i>
            </button>
            <div
              v-if="accountOpen"
              id="account-menu"
              class="account-panel"
              role="menu"
            >
              <template v-if="auth.isLoggedIn">
                <p class="account-name">{{ auth.user?.name || 'خریدار' }}</p>
                <p class="account-meta">{{ auth.user?.phone }}</p>
                <router-link to="/account" role="menuitem" @click="accountOpen = false">
                  حساب کاربری
                </router-link>
                <router-link to="/account/orders" role="menuitem" @click="accountOpen = false">
                  سفارش‌های من
                </router-link>
                <router-link to="/account/profile" role="menuitem" @click="accountOpen = false">
                  اطلاعات حساب
                </router-link>
                <router-link v-if="auth.isAdmin" to="/dashboard" role="menuitem" @click="accountOpen = false">
                  داشبورد
                </router-link>
                <button type="button" role="menuitem" @click="logout">خروج</button>
              </template>
              <template v-else>
                <p class="account-name">ورود به حساب</p>
                <p class="account-meta">برای دیدن و ثبت اطلاعات کاربری وارد شوید.</p>
                <router-link to="/login" role="menuitem" @click="accountOpen = false">ورود</router-link>
                <router-link to="/register" role="menuitem" @click="accountOpen = false">ثبت‌نام</router-link>
              </template>
            </div>
          </div>

          <router-link
            to="/cart"
            class="icon-btn hidden lg:grid"
            :class="{ 'is-overlay': overlay }"
            aria-label="سبد خرید"
          >
            <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
            <span v-if="cart.totalCount" class="cart-badge">{{ cart.totalCount }}</span>
          </router-link>

          <button
            ref="menuTrigger"
            class="hamburger lg:hidden"
            :class="{ 'is-overlay': overlay, 'is-open': mobileOpen }"
            type="button"
            :aria-expanded="mobileOpen"
            aria-controls="mobile-drawer"
            aria-label="منوی سایت"
            @click="toggleMobile"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        class="hidden lg:block"
        :class="overlay ? 'border-t border-white/10' : 'border-t border-sand/80'"
      >
        <ul
          class="container-shop flex items-center gap-5 text-[13px] py-2.5 whitespace-nowrap overflow-x-clip"
          :class="overlay ? 'text-white/75' : 'text-ink/80'"
        >
          <li v-for="item in navItems" :key="item.name || item.slug" class="relative group">
            <router-link v-if="item.to" :to="item.to" class="hover:text-ember transition">
              {{ item.label || item.name }}
            </router-link>
            <template v-else>
              <router-link
                :to="`/products/category/${item.slug}`"
                class="inline-flex items-center gap-1.5 hover:text-ember transition"
                aria-haspopup="true"
              >
                {{ item.name }}
                <i class="fa-solid fa-chevron-down text-[10px]" aria-hidden="true"></i>
              </router-link>
              <div
                class="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto absolute right-0 top-full z-40 pt-2"
              >
                <ul class="w-56 rounded-2xl border border-sand bg-bone text-ink shadow-soft p-2">
                  <li>
                    <router-link
                      :to="`/products/category/${item.slug}`"
                      class="block rounded-xl px-3 py-2 font-semibold hover:bg-sand"
                    >
                      همه {{ item.name }}
                    </router-link>
                  </li>
                  <li v-for="child in item.children" :key="child.slug">
                    <router-link
                      :to="`/products/category/${child.slug}`"
                      class="block rounded-xl px-3 py-2 hover:bg-sand"
                    >
                      {{ child.name }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </template>
          </li>
        </ul>
      </nav>
    </header>

    <div class="navbar-spacer" :style="{ height: `${headerHeight}px` }" aria-hidden="true" />

    <Teleport to="body">
      <Transition name="drawer-fade">
        <button
          v-if="mobileOpen"
          class="mobile-drawer-backdrop lg:hidden"
          type="button"
          aria-label="بستن منو"
          @click="close"
        />
      </Transition>

      <aside
        id="mobile-drawer"
        ref="drawerEl"
        class="mobile-drawer lg:hidden"
        :class="{ 'is-open': mobileOpen }"
        role="dialog"
        :aria-modal="mobileOpen"
        aria-label="منوی سایت"
        :aria-hidden="!mobileOpen"
        :inert="!mobileOpen"
      >
        <div class="mobile-drawer__head">
          <button class="mobile-drawer__close" type="button" aria-label="بستن منو" @click="close">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <nav class="mobile-drawer__nav">
          <router-link class="mobile-drawer__link" to="/" @click="close">خانه</router-link>
          <router-link class="mobile-drawer__link" to="/products" @click="close">
            <i class="fa-solid fa-border-all" aria-hidden="true"></i>
            محصولات
          </router-link>
          <div
            v-for="group in products.categories"
            :key="group.slug"
            class="mobile-drawer__group"
            :class="{ 'is-open': openGroup === group.slug }"
          >
            <button
              class="mobile-drawer__group-btn"
              type="button"
              :aria-expanded="openGroup === group.slug"
              @click="toggleGroup(group.slug)"
            >
              <span>{{ group.name }}</span>
              <i class="fa-solid fa-chevron-down text-xs" aria-hidden="true"></i>
            </button>
            <div class="mobile-drawer__sub">
              <router-link
                :to="`/products/category/${group.slug}`"
                class="mobile-drawer__sublink mobile-drawer__sublink--all"
                @click="close"
              >
                همه {{ group.name }}
              </router-link>
              <router-link
                v-for="child in group.children"
                :key="child.slug"
                :to="`/products/category/${child.slug}`"
                class="mobile-drawer__sublink"
                @click="close"
              >
                {{ child.name }}
              </router-link>
            </div>
          </div>
          <router-link class="mobile-drawer__link" to="/contact" @click="close">
            <i class="fa-solid fa-phone" aria-hidden="true"></i>
            تماس
          </router-link>
          <router-link class="mobile-drawer__link" :to="auth.isLoggedIn ? '/account' : '/login'" @click="close">
            <i class="fa-regular fa-user" aria-hidden="true"></i>
            {{ auth.isLoggedIn ? 'حساب کاربری' : 'ورود / ثبت‌نام' }}
          </router-link>
        </nav>
      </aside>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { asset } from '@/utils/asset'
import { displayPrice } from '@/utils/money'

const cart = useCartStore()
const auth = useAuthStore()
const products = useProductStore()
const route = useRoute()
const router = useRouter()
const query = ref('')
const suggestOpen = ref(false)
const mobileOpen = ref(false)
const accountOpen = ref(false)
const accountRoot = ref(null)
const headerWrap = ref(null)
const headerEl = ref(null)
const openGroup = ref('')
const scrolled = ref(false)
const navHidden = ref(false)
const headerHeight = ref(64)
const lastScrollY = ref(0)
const drawerEl = ref(null)
const menuTrigger = ref(null)
const restoreMenuFocus = ref(false)
const MENU_EVENT = 'imen:open-shop-menu'

const overlay = computed(() => route.name === 'Home' && !scrolled.value && !mobileOpen.value)

const suggestions = computed(() => {
  const q = query.value.trim()
  if (q.length < 2) return []
  return products.search(q).slice(0, 6)
})

const showSuggest = computed(() => suggestOpen.value && query.value.trim().length >= 2)

function measureHeader() {
  headerHeight.value = headerEl.value?.offsetHeight || 64
}

function onScroll() {
  const current = window.scrollY
  scrolled.value = current > 48

  if (headerEl.value?.contains(document.activeElement) || mobileOpen.value) {
    navHidden.value = false
    lastScrollY.value = current
    return
  }

  if (current <= 16) {
    navHidden.value = false
  } else if (current > lastScrollY.value + 4) {
    navHidden.value = true
    accountOpen.value = false
  } else if (current < lastScrollY.value - 4) {
    navHidden.value = false
  }

  lastScrollY.value = current
}

function onDocClick(event) {
  if (!accountRoot.value?.contains(event.target)) accountOpen.value = false
  if (!event.target.closest('.search-wrap')) suggestOpen.value = false
}

function trapDrawerFocus(event) {
  const root = drawerEl.value
  if (!root) return
  const nodes = [...root.querySelectorAll('a[href], button:not([disabled]), input, textarea, select')].filter(
    (el) => el.getClientRects().length,
  )
  if (!nodes.length) return
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKey(event) {
  if (event.key === 'Escape') {
    suggestOpen.value = false
    close()
  }
  if (event.key === 'Tab' && mobileOpen.value) trapDrawerFocus(event)
}

function openMobileMenu() {
  mobileOpen.value = true
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function logout() {
  auth.logout()
  accountOpen.value = false
  router.push('/')
}

onMounted(async () => {
  onScroll()
  measureHeader()
  await nextTick()
  measureHeader()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measureHeader)
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
  window.addEventListener(MENU_EVENT, openMobileMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measureHeader)
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener(MENU_EVENT, openMobileMenu)
  document.body.style.overflow = ''
})

const navItems = computed(() => [
  { name: 'home', label: 'خانه', to: '/' },
  { name: 'catalog', label: 'محصولات', to: '/products' },
  ...products.categories,
  { name: 'contact', label: 'تماس', to: '/contact' },
])

function search() {
  router.push({ name: 'ProductsApp', query: query.value ? { q: query.value } : {} })
  suggestOpen.value = false
  close()
}

function toggleGroup(slug) {
  openGroup.value = openGroup.value === slug ? '' : slug
}

function close(restore = true) {
  restoreMenuFocus.value = Boolean(restore && mobileOpen.value)
  mobileOpen.value = false
  accountOpen.value = false
  openGroup.value = ''
  suggestOpen.value = false
}

watch(
  () => route.query.q,
  (value) => {
    query.value = String(value || '')
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    close(false)
  },
)

watch(mobileOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    navHidden.value = false
    await nextTick()
    drawerEl.value?.querySelector('.mobile-drawer__close')?.focus()
    return
  }
  if (restoreMenuFocus.value && menuTrigger.value && document.body.contains(menuTrigger.value)) {
    menuTrigger.value.focus()
  }
  restoreMenuFocus.value = false
})

watch(
  () => route.name,
  async () => {
    await nextTick()
    measureHeader()
  },
)
</script>

<style scoped>
.navbar-bar {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.navbar-brand {
  max-width: 6.5rem;
}

@media (min-width: 400px) {
  .navbar-brand {
    max-width: none;
  }
}

.icon-btn {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  position: relative;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
}

.search-wrap {
  position: relative;
}

.search-suggest {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline: 0;
  z-index: 90;
  max-height: min(22rem, 70vh);
  overflow-y: auto;
  padding: 0.4rem;
  border: 1px solid var(--color-sand);
  border-radius: 16px;
  background: var(--color-bone);
  color: var(--color-ink);
  box-shadow: var(--shadow-md);
}

.search-suggest__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 3.25rem;
  padding: 0.4rem 0.55rem;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
}

.search-suggest__item img {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
}

.search-suggest__copy {
  min-width: 0;
  display: grid;
  gap: 0.1rem;
}

.search-suggest__copy span {
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-suggest__copy strong {
  color: var(--color-ash);
  font-size: 0.72rem;
  font-weight: 700;
}

.search-suggest__item:hover,
.search-suggest__item:focus-visible {
  background: var(--color-sand);
}

.search-suggest__empty {
  margin: 0;
  padding: 0.7rem 0.55rem 0.35rem;
  color: var(--color-ash);
  font-size: 0.78rem;
}

.search-suggest__all {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.75rem;
  margin-top: 0.2rem;
  border: 0;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-ember) 10%, #fff);
  color: var(--color-ember);
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}

.icon-btn:hover,
.icon-btn:focus-visible {
  background: rgba(28, 25, 22, 0.06);
}

.icon-btn.is-overlay:hover,
.icon-btn.is-overlay:focus-visible {
  background: rgba(255, 255, 255, 0.12);
}

.cart-badge {
  position: absolute;
  top: 2px;
  inset-inline-end: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-ember);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
  line-height: 1;
}

.account-panel {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-end: 0;
  inset-inline-start: auto;
  z-index: 80;
  width: 17.5rem;
  min-width: 17.5rem;
  max-width: calc(100vw - 2rem);
  height: auto;
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid var(--color-sand);
  background: var(--color-bone);
  color: var(--color-ink);
  box-shadow: var(--shadow-md);
  white-space: normal;
}

.account-name {
  font-weight: 700;
  padding: 6px 10px 0;
}

.account-meta {
  color: var(--color-ash);
  font-size: 12px;
  padding: 2px 10px 8px;
}

.account-panel a,
.account-panel button[role='menuitem'] {
  display: block;
  width: 100%;
  text-align: start;
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  color: inherit;
}

.account-panel a:hover,
.account-panel button[role='menuitem']:hover {
  background: var(--color-sand);
}

.hamburger {
  width: 44px;
  height: 44px;
  display: inline-grid;
  align-content: center;
  justify-items: center;
  gap: 5px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  color: inherit;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 16px;
  height: 1.5px;
  background: currentColor;
  transition: transform 180ms ease, opacity 180ms ease;
}

.hamburger.is-open span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.hamburger.is-open span:nth-child(2) {
  opacity: 0;
}

.hamburger.is-open span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

.mobile-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  border: 0;
  background: rgba(12, 14, 18, 0.35);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  width: min(17rem, 78vw);
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1.5rem;
  background: var(--color-bone);
  border-inline-start: 1px solid var(--color-sand);
  box-shadow: -12px 0 32px rgba(12, 14, 18, 0.12);
  transform: translateX(110%);
  transition: transform 280ms ease;
  pointer-events: none;
  overflow-y: auto;
}

.mobile-drawer.is-open {
  transform: translateX(0);
  pointer-events: auto;
}

.mobile-drawer__head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-sand);
}

.mobile-drawer__close {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: var(--color-sand);
  color: var(--color-ink);
  cursor: pointer;
}

.mobile-drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.92rem;
}

.mobile-drawer__link,
.mobile-drawer__group-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.65rem;
  width: 100%;
  min-height: 44px;
  padding: 0.55rem 0.35rem;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
}

.mobile-drawer__link i {
  width: 1.1rem;
  text-align: center;
  color: var(--color-ember);
}

.mobile-drawer__group-btn {
  justify-content: space-between;
  font-weight: 700;
}

.mobile-drawer__link:hover,
.mobile-drawer__link:focus-visible,
.mobile-drawer__group-btn:hover,
.mobile-drawer__group-btn:focus-visible,
.mobile-drawer__sublink:hover,
.mobile-drawer__sublink:focus-visible {
  background: color-mix(in srgb, var(--color-ember) 12%, #fff);
  color: var(--color-ember);
}

.mobile-drawer__link:active,
.mobile-drawer__group-btn:active,
.mobile-drawer__sublink:active {
  background: color-mix(in srgb, var(--color-ember) 18%, #fff);
}

.mobile-drawer__group-btn i {
  color: var(--color-ash);
  transition: transform 180ms ease, color 180ms ease;
}

.mobile-drawer__group.is-open .mobile-drawer__group-btn,
.mobile-drawer__group:hover .mobile-drawer__group-btn {
  background: color-mix(in srgb, var(--color-ember) 12%, #fff);
  color: var(--color-ember);
}

.mobile-drawer__group.is-open .mobile-drawer__group-btn i,
.mobile-drawer__group:hover .mobile-drawer__group-btn i {
  color: var(--color-ember);
  transform: rotate(180deg);
}

.mobile-drawer__sub {
  display: none;
  padding: 0.15rem 0 0.45rem 0.35rem;
}

.mobile-drawer__group.is-open .mobile-drawer__sub,
.mobile-drawer__group:hover .mobile-drawer__sub {
  display: block;
}

.mobile-drawer__sublink {
  display: block;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  color: var(--color-ash);
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
}

.mobile-drawer__sublink--all {
  font-weight: 700;
  color: var(--color-ink);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 220ms ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

@media (min-width: 1024px) {
  .hamburger {
    display: none;
  }
}
</style>
