<template>
  <Teleport to="body">
    <nav
      v-if="props.enabled"
      class="shop-mobile-dock"
      dir="ltr"
      role="navigation"
      aria-label="ناوبری پایین موبایل"
    >
      <button class="shop-mobile-dock__circle" type="button" aria-label="بازگشت" @click="goBack">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>

      <div class="shop-mobile-dock__pill">
        <router-link
          v-for="item in dockItems"
          :key="item.label"
          :to="item.to"
          class="shop-mobile-dock__item"
          :class="{ 'is-active': item.active }"
          :aria-label="item.label"
          :aria-current="item.active ? 'page' : undefined"
          @click="item.onClick"
        >
          <span class="shop-mobile-dock__icon-wrap">
            <i :class="item.icon" aria-hidden="true"></i>
          </span>
        </router-link>
      </div>

      <router-link
        to="/cart"
        class="shop-mobile-dock__circle"
        :class="{ 'is-active': route.path.startsWith('/cart') }"
        aria-label="سبد خرید"
      >
        <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
        <span v-if="cart.totalCount" class="shop-mobile-dock__badge">{{ cart.totalCount }}</span>
      </router-link>
    </nav>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

const props = defineProps({
  enabled: { type: Boolean, default: true },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function focusSearch(event) {
  if (route.path.startsWith('/products')) {
    event.preventDefault()
    requestAnimationFrame(() => {
      document.getElementById('site-search-mobile')?.focus()
    })
  }
}

const dockItems = computed(() => {
  const profileTo = auth.isLoggedIn ? '/account' : '/login'
  return [
    {
      label: 'خانه',
      to: '/',
      icon: 'fa-solid fa-house',
      active: route.path === '/' || route.path === '',
    },
    {
      label: 'جستجو',
      to: '/products',
      icon: 'fa-solid fa-magnifying-glass',
      active: route.name === 'ProductsApp',
      onClick: focusSearch,
    },
    {
      label: 'دسته‌ها',
      to: '/products',
      icon: 'fa-solid fa-border-all',
      active: route.name === 'ProductCategory',
    },
    {
      label: 'حساب',
      to: profileTo,
      icon: 'fa-regular fa-user',
      active:
        route.path.startsWith('/account') ||
        route.path === '/login' ||
        route.path === '/register',
    },
  ]
})
</script>

<style>
/* Critical: always with component — CSS-only mobile visibility (no JS matchMedia) */
.shop-mobile-dock {
  position: fixed !important;
  left: 50% !important;
  bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px)) !important;
  z-index: 2147483000 !important;
  display: none !important;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: min(calc(100vw - 1.25rem), 26rem);
  transform: translateX(-50%);
  pointer-events: none;
  visibility: visible !important;
  opacity: 1 !important;
}

@media (max-width: 1023px) {
  .shop-mobile-dock {
    display: flex !important;
  }
}

.shop-mobile-dock__circle,
.shop-mobile-dock__pill,
.shop-mobile-dock__item {
  pointer-events: auto;
}

.shop-mobile-dock__circle {
  position: relative;
  display: grid;
  place-items: center;
  width: 3.15rem;
  height: 3.15rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1c1916;
  box-shadow: 0 10px 28px rgba(12, 14, 18, 0.16);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  text-decoration: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.shop-mobile-dock__circle.is-active {
  color: #c45c26;
}

.shop-mobile-dock__pill {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-evenly;
  gap: 0.15rem;
  min-width: 0;
  height: 3.35rem;
  padding: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12px 32px rgba(12, 14, 18, 0.16);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.shop-mobile-dock__item {
  display: inline-flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
  color: #6b6560;
  text-decoration: none;
}

.shop-mobile-dock__icon-wrap {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  font-size: 1rem;
  line-height: 1;
}

.shop-mobile-dock__item.is-active {
  color: #1c1916;
}

.shop-mobile-dock__item.is-active .shop-mobile-dock__icon-wrap {
  background: #fff;
  box-shadow: 0 4px 14px rgba(12, 14, 18, 0.12);
}

.shop-mobile-dock__badge {
  position: absolute;
  top: 0.15rem;
  right: 0.1rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 3px;
  border-radius: 999px;
  background: #c45c26;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: grid;
  place-items: center;
  line-height: 1;
}

@media print {
  .shop-mobile-dock {
    display: none !important;
  }
}
</style>
