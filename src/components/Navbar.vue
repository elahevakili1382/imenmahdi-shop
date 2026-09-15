<template>
  <header
    class="sticky top-0 z-50 overflow-visible backdrop-blur-md transition-colors duration-300"
    :class="
      overlay
        ? 'border-b border-white/10 bg-night/70 text-stone'
        : 'border-b border-sand bg-stone/90 text-ink'
    "
  >
    <div class="container-shop flex items-center gap-4 py-3.5">
      <router-link to="/" class="shrink-0 leading-tight">
        <span class="block text-[11px] tracking-[0.22em] text-ember">IMEN YAB</span>
        <span class="block font-extrabold text-xl">ایمن یاب</span>
      </router-link>

      <form
        class="hidden md:flex flex-1 max-w-xl h-11 items-stretch overflow-hidden rounded-full border"
        :class="overlay ? 'border-white/15 bg-white/10' : 'border-sand bg-bone'"
        @submit.prevent="search"
      >
        <label class="sr-only" for="site-search">جستجوی محصولات</label>
        <input
          id="site-search"
          v-model="query"
          type="search"
          placeholder="جستجوی کلاه، ماسک، لباس آتش‌نشانی..."
          class="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-sm outline-none"
          :class="overlay ? 'text-stone placeholder:text-white/45' : 'text-ink'"
        />
        <button
          class="h-full min-h-0 shrink-0 rounded-none px-5 text-sm font-semibold bg-night text-stone hover:bg-ink"
          type="submit"
        >
          جستجو
        </button>
      </form>

      <div class="ms-auto flex items-center gap-1">
        <div ref="accountRoot" class="relative z-[80] shrink-0">
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
          class="icon-btn"
          :class="{ 'is-overlay': overlay }"
          aria-label="سبد خرید"
        >
          <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
          <span v-if="cart.totalCount" class="cart-badge">{{ cart.totalCount }}</span>
        </router-link>

        <button
          class="hamburger"
          :class="{ 'is-overlay': overlay }"
          type="button"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-nav"
          aria-label="منوی سایت"
          @click="mobileOpen = !mobileOpen"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <form
      class="md:hidden container-shop pb-3"
      @submit.prevent="search"
    >
      <div
        class="flex h-11 items-stretch overflow-hidden rounded-full border"
        :class="overlay ? 'border-white/15 bg-white/10' : 'border-sand bg-bone'"
      >
        <label class="sr-only" for="site-search-mobile">جستجوی محصولات</label>
        <input
          id="site-search-mobile"
          v-model="query"
          type="search"
          placeholder="جستجوی کالا..."
          class="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-sm outline-none"
          :class="overlay ? 'text-stone placeholder:text-white/45' : 'text-ink'"
        />
        <button class="h-full shrink-0 bg-night px-4 text-sm font-semibold text-stone" type="submit">
          جستجو
        </button>
      </div>
    </form>

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
            >
              {{ item.name }}
              <i class="fa-solid fa-chevron-down text-[10px]" aria-hidden="true"></i>
            </router-link>
            <div
              class="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto absolute right-0 top-full z-40 pt-2"
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

    <div
      v-if="mobileOpen"
      id="mobile-nav"
      class="lg:hidden border-t border-sand bg-bone text-ink px-4 py-4"
    >
      <nav class="flex flex-col text-sm">
        <router-link class="py-2.5 border-b border-sand/70" to="/" @click="close">خانه</router-link>
        <div v-for="group in categoryTree" :key="group.slug" class="border-b border-sand/70">
          <button
            class="flex w-full min-h-12 items-center justify-between gap-3 py-2.5 font-semibold text-start active:bg-sand rounded-xl px-1"
            type="button"
            :aria-expanded="openGroup === group.slug"
            @click="toggleGroup(group.slug)"
          >
            <span>{{ group.name }}</span>
            <i
              class="fa-solid fa-chevron-down text-steel text-xs transition"
              :class="openGroup === group.slug ? 'rotate-180' : ''"
              aria-hidden="true"
            ></i>
          </button>
          <div v-if="openGroup === group.slug" class="pb-2 pr-1">
            <router-link
              :to="`/products/category/${group.slug}`"
              class="block rounded-xl px-3 py-2.5 font-semibold hover:bg-sand active:bg-sand"
              @click="close"
            >
              همه {{ group.name }}
            </router-link>
            <router-link
              v-for="child in group.children"
              :key="child.slug"
              :to="`/products/category/${child.slug}`"
              class="block rounded-xl px-3 py-2.5 text-steel hover:bg-sand hover:text-ink active:bg-sand"
              @click="close"
            >
              {{ child.name }}
            </router-link>
          </div>
        </div>
        <router-link class="py-2.5 border-b border-sand/70" to="/contact" @click="close">تماس</router-link>
        <router-link class="py-2.5" :to="auth.isLoggedIn ? '/account' : '/login'" @click="close">
          {{ auth.isLoggedIn ? 'حساب کاربری' : 'ورود / ثبت‌نام' }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryTree } from '@/data/catalog'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const cart = useCartStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const query = ref('')
const mobileOpen = ref(false)
const accountOpen = ref(false)
const accountRoot = ref(null)
const openGroup = ref('')
const scrolled = ref(false)

const overlay = computed(() => route.name === 'Home' && !scrolled.value && !mobileOpen.value)

function onScroll() {
  scrolled.value = window.scrollY > 48
}

function onDocClick(event) {
  if (!accountRoot.value?.contains(event.target)) accountOpen.value = false
}

function onKey(event) {
  if (event.key === 'Escape') {
    accountOpen.value = false
    mobileOpen.value = false
  }
}

function logout() {
  auth.logout()
  accountOpen.value = false
  router.push('/')
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKey)
})

const navItems = computed(() => [
  { name: 'home', label: 'خانه', to: '/' },
  ...categoryTree,
  { name: 'contact', label: 'تماس', to: '/contact' },
])

function search() {
  router.push({ name: 'ProductsApp', query: query.value ? { q: query.value } : {} })
  close()
}

function toggleGroup(slug) {
  openGroup.value = openGroup.value === slug ? '' : slug
}

function close() {
  mobileOpen.value = false
  accountOpen.value = false
  openGroup.value = ''
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
    close()
  },
)
</script>

<style scoped>
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
  display: none;
}

@media (max-width: 1023px) {
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
  }
}
</style>
