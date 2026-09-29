<template>
  <section class="admin-products">
    <header class="admin-products__head">
      <div>
        <h1>مدیریت محصولات</h1>
        <p>{{ store.products.length }} کالا در کاتالوگ</p>
      </div>
      <router-link class="btn btn-primary min-h-10 text-sm" :to="{ name: 'AdminProductNew' }">
        افزودن محصول
      </router-link>
    </header>

    <input
      v-model="query"
      class="admin-products__search"
      type="search"
      placeholder="جستجوی نام، برند یا دسته"
      autocomplete="off"
    />

    <div v-if="!visible.length" class="admin-products__empty">
      <p>{{ query.trim() ? 'نتیجه‌ای پیدا نشد.' : 'هنوز محصولی ثبت نشده است.' }}</p>
      <router-link v-if="!query.trim()" class="btn btn-primary text-sm" :to="{ name: 'AdminProductNew' }">
        اولین محصول را اضافه کنید
      </router-link>
    </div>

    <div v-else class="admin-products__list">
      <article v-for="product in visible" :key="product.id" class="product-row">
        <img :src="asset(product.image)" alt="" class="product-row__img" loading="lazy" />
        <div class="product-row__body">
          <p class="product-row__title">{{ product.title }}</p>
          <p class="product-row__meta">
            <span v-if="product.brand">{{ product.brand }} · </span>
            {{ product.category }} · {{ product.stock }} · {{ displayPrice(product) }}
            <span v-if="product.sizes?.length"> · سایز: {{ product.sizes.join('، ') }}</span>
          </p>
        </div>
        <div class="product-row__actions">
          <router-link
            class="icon-btn"
            :to="{ name: 'AdminProductEdit', params: { id: product.id } }"
            aria-label="ویرایش"
            title="ویرایش"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448l-3-3l-9.452 9.448a.5.5 0 0 0-.147.353m10.837-11.04l3 3l1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0z"
              />
            </svg>
          </router-link>
          <button
            class="icon-btn icon-btn--danger"
            type="button"
            aria-label="حذف"
            title="حذف"
            @click="remove(product)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5"
              />
            </svg>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { asset } from '@/utils/asset'
import { displayPrice } from '@/utils/money'
import { useToast } from 'vue-toastification'

const store = useProductStore()
const toast = useToast()
const query = ref('')

const visible = computed(() => {
  const q = query.value.trim()
  if (!q) return store.products
  return store.search(q)
})

onMounted(() => {
  store.hydrate()
})

async function remove(product) {
  if (!window.confirm(`حذف «${product.title}»؟`)) return
  const persist = await store.remove(product.id)
  if (persist && persist.ok === false) {
    if (persist.reason === 'offline') {
      toast.warning('حذف فقط روی این دستگاه ماند. API را روشن کن تا روی سرور هم پاک شود.')
      return
    }
    toast.error(persist.message || 'حذف روی سرور کامل نشد')
    return
  }
  toast.success('حذف شد و روی سرور ذخیره شد')
}
</script>

<style scoped>
.admin-products {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.admin-products__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-products__head h1 {
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 800;
  color: var(--dash-text, #0f172a);
}

.admin-products__head p {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.admin-products__search {
  width: 100%;
  min-height: 2.85rem;
  padding: 0.7rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid var(--dash-line, #e2e8f0);
  background: #fff;
  color: var(--dash-text, #0f172a);
  font-size: 0.9rem;
}

.admin-products__search:focus {
  outline: 2px solid color-mix(in srgb, var(--dash-primary, #1b8f5a) 40%, transparent);
  border-color: transparent;
}

.admin-products__empty {
  display: grid;
  gap: 0.85rem;
  justify-items: start;
  padding: 2rem 1.25rem;
  border-radius: 1rem;
  border: 1px dashed var(--dash-line, #e2e8f0);
  background: #fff;
  color: var(--dash-muted, #64748b);
}

.admin-products__list {
  display: grid;
  gap: 0.65rem;
}

.product-row {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 1rem;
  border: 1px solid var(--dash-line, #e2e8f0);
  background: #fff;
  min-width: 0;
}

.product-row__img {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  object-fit: contain;
  background: #f8fafc;
}

.product-row__body {
  min-width: 0;
}

.product-row__title {
  margin: 0;
  font-weight: 800;
  font-size: 0.92rem;
  color: var(--dash-text, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-row__meta {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--dash-muted, #64748b);
  overflow-wrap: anywhere;
}

.product-row__actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 12px;
  border: 1px solid #d9e0e6;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  text-decoration: none;
}

.icon-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.icon-btn--danger {
  color: #b91c1c;
  border-color: #f0d0d0;
}

.icon-btn--danger:hover {
  background: #fff5f5;
  border-color: #fca5a5;
}

@media (max-width: 520px) {
  .product-row {
    grid-template-columns: 3rem minmax(0, 1fr);
  }

  .product-row__img {
    width: 3rem;
    height: 3rem;
  }

  .product-row__actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
