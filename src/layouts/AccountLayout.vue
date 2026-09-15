<template>
  <section class="account-page">
    <div class="container-shop account-shell">
      <aside class="account-sidebar" aria-label="منوی حساب کاربری">
        <div class="account-user">
          <span class="account-avatar" aria-hidden="true">{{ initial }}</span>
          <div class="min-w-0">
            <p class="account-hello">سلام {{ firstName }}</p>
            <p class="account-phone" dir="ltr">{{ auth.user?.phone }}</p>
          </div>
        </div>

        <nav class="account-nav">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="account-nav-link"
            :class="{ 'is-active': isActive(link) }"
          >
            <i :class="['fa-solid', link.icon]" aria-hidden="true"></i>
            <span>{{ link.label }}</span>
          </router-link>
          <router-link v-if="auth.isAdmin" to="/dashboard" class="account-nav-link">
            <i class="fa-solid fa-gauge-high" aria-hidden="true"></i>
            <span>داشبورد مدیریت</span>
          </router-link>
          <button class="account-nav-link is-exit" type="button" @click="logout">
            <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
            <span>خروج از حساب</span>
          </button>
        </nav>
      </aside>

      <div class="account-main">
        <RouterView />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const firstName = computed(() => {
  const parts = String(auth.user?.name || '').trim().split(/\s+/).filter(Boolean)
  return parts[0] || 'خریدار'
})

const initial = computed(() => firstName.value.slice(0, 1))

const links = [
  { to: '/account', label: 'خلاصه حساب', icon: 'fa-house', exact: true },
  { to: '/account/orders', label: 'سفارش‌های من', icon: 'fa-bag-shopping' },
  { to: '/account/profile', label: 'اطلاعات حساب', icon: 'fa-user' },
]

function isActive(link) {
  return link.exact ? route.path === link.to : route.path.startsWith(link.to)
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.account-page {
  min-height: calc(100vh - 5.5rem);
  background: var(--color-paper);
  padding-block: 1.75rem 3rem;
}

.account-shell {
  display: grid;
  gap: 1.25rem;
}

.account-sidebar,
.account-main > :deep(section),
.account-main > :deep(.account-panel) {
  min-width: 0;
}

.account-sidebar {
  background: var(--color-bone);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 1.15rem 1rem;
}

.account-user {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.35rem 0.4rem 1rem;
  border-bottom: 1px solid var(--color-sand);
  margin-bottom: 0.65rem;
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ember) 14%, var(--color-sand));
  color: var(--color-ember);
  font-weight: 800;
  font-size: 1.15rem;
}

.account-hello {
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1.4;
}

.account-phone {
  margin-top: 0.15rem;
  color: var(--color-ash);
  font-size: 0.8rem;
  text-align: start;
}

.account-nav {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.account-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border-radius: 12px;
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.account-nav-link i {
  width: 1.1rem;
  text-align: center;
  color: var(--color-ash);
}

.account-nav-link:hover,
.account-nav-link.is-active {
  background: color-mix(in srgb, var(--color-ember) 8%, var(--color-paper));
}

.account-nav-link.is-active {
  color: var(--color-ember);
}

.account-nav-link.is-active i {
  color: var(--color-ember);
}

.account-nav-link.is-exit {
  color: var(--color-danger);
}

.account-nav-link.is-exit i {
  color: var(--color-danger);
}

@media (min-width: 960px) {
  .account-shell {
    grid-template-columns: 280px minmax(0, 1fr);
    align-items: start;
    gap: 1.5rem;
  }

  .account-sidebar {
    position: sticky;
    top: 5.5rem;
    padding: 1.35rem 1.1rem;
  }

  .account-nav {
    flex-direction: column;
    overflow: visible;
  }

  .account-nav-link {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
