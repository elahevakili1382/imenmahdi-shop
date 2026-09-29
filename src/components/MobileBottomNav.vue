<template>
  <Teleport to="body">
    <nav class="shop-mobile-dock" dir="rtl" role="navigation" aria-label="ناوبری پایین موبایل">
      <router-link
        v-for="item in dockItems"
        :key="item.label"
        :to="item.to"
        class="shop-mobile-dock__item"
        :class="{ 'is-active': item.active }"
        :aria-current="item.active ? 'page' : undefined"
      >
        <span class="shop-mobile-dock__icon">
          <i :class="item.active ? item.iconOn : item.iconOff" aria-hidden="true"></i>
          <span v-if="item.badge" class="shop-mobile-dock__badge">{{ item.badge }}</span>
        </span>
        <span class="shop-mobile-dock__label">{{ item.label }}</span>
      </router-link>
    </nav>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const dockItems = computed(() => {
  const path = route.path
  const onCatalog =
    route.name === 'ProductsApp' ||
    route.name === 'ProductCategory' ||
    route.name === 'ProductDetail'
  return [
    {
      label: 'خانه',
      to: '/',
      iconOff: 'fa-solid fa-house',
      iconOn: 'fa-solid fa-house',
      active: path === '/' || path === '',
    },
    {
      label: 'محصولات',
      to: '/products',
      iconOff: 'fa-solid fa-border-all',
      iconOn: 'fa-solid fa-border-all',
      active: onCatalog,
    },
    {
      label: 'سبد',
      to: '/cart',
      iconOff: 'fa-solid fa-bag-shopping',
      iconOn: 'fa-solid fa-bag-shopping',
      badge: cart.totalCount || undefined,
      active: path.startsWith('/cart') || route.name === 'Checkout',
    },
    {
      label: 'حساب',
      to: auth.isLoggedIn ? '/account' : '/login',
      iconOff: 'fa-regular fa-user',
      iconOn: 'fa-solid fa-user',
      active:
        path.startsWith('/account') || path === '/login' || path === '/register',
    },
  ]
})
</script>

<style>
.shop-mobile-dock {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  z-index: 9998;
  display: none !important;
  align-items: stretch;
  justify-content: space-around;
  gap: 2px;
  height: 64px;
  max-width: 28rem;
  margin-inline: auto;
  padding: 4px;
  border: 1px solid var(--color-line, #d9d0c3);
  border-radius: 22px;
  background: #fbfaf7;
  box-shadow: 0 12px 32px rgba(12, 14, 18, 0.14);
  pointer-events: auto;
  visibility: visible;
}

@media (max-width: 1023px) {
  .shop-mobile-dock {
    display: flex !important;
  }
}

.shop-mobile-dock__item {
  position: relative;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-width: 44px;
  min-height: 44px;
  border-radius: 18px;
  color: #6b6560;
  text-decoration: none;
  cursor: pointer;
}

.shop-mobile-dock__item.is-active {
  color: #c45c26;
  background: color-mix(in srgb, #c45c26 10%, #fff);
}

.shop-mobile-dock__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.05rem;
  line-height: 1;
}

.shop-mobile-dock__label {
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
}

.shop-mobile-dock__badge {
  position: absolute;
  top: -0.35rem;
  inset-inline-end: -0.45rem;
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

.shop-mobile-dock__badge:empty {
  display: none;
}

@media print {
  .shop-mobile-dock {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shop-mobile-dock__item {
    transition: none;
  }
}
</style>
