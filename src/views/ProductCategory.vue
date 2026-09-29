<template>
  <section class="container-shop py-8 sm:py-10 min-w-0">
    <p class="text-sm text-steel mb-2">
      <router-link to="/" class="hover:text-ember">خانه</router-link>
      <span> / </span>
      <router-link to="/products" class="hover:text-ember">کاتالوگ</router-link>
      <span> / </span>
      {{ title }}
    </p>
    <h1 class="text-2xl sm:text-3xl font-bold mb-2">{{ title }}</h1>
    <div class="list-toolbar">
      <p class="text-sm text-steel">{{ formatCount(visible.length) }} کالا</p>
      <label class="sort-field">
        <span class="sr-only">مرتب‌سازی</span>
        <select :value="sortMode" @change="setSort($event.target.value)">
          <option v-for="option in SORT_OPTIONS" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="childLinks.length" class="cat-chips" aria-label="زیردسته‌ها">
      <router-link
        v-if="parentSlug"
        :to="`/products/category/${parentSlug}`"
        class="cat-chip"
        :class="{ 'is-on': slug === parentSlug }"
      >
        همه {{ parentGroup?.name }}
      </router-link>
      <router-link
        v-for="child in childLinks"
        :key="child.slug"
        :to="`/products/category/${child.slug}`"
        class="cat-chip"
        :class="{ 'is-on': slug === child.slug }"
      >
        {{ child.name }}
      </router-link>
    </div>

    <div class="lg:hidden mb-4">
      <button class="btn btn-dark min-h-11 text-sm w-full sm:w-auto" type="button" @click="filtersOpen = !filtersOpen">
        {{ filtersOpen ? 'بستن فیلتر' : 'فیلترها' }}
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <div class="lg:sticky lg:top-24 lg:self-start" :class="filtersOpen ? 'block' : 'hidden lg:block'">
        <ProductFilters
          :selected-categories="[slug]"
          :selected-sizes="selectedSizes"
          :selected-colors="selectedColors"
          :available-sizes="availableSizes"
          :available-colors="availableColors"
          :price="price"
          :bounds="bounds"
          :locked-category="slug"
          @toggle-size="toggle('sizes', $event)"
          @toggle-color="toggle('colors', $event)"
          @update-price="setPrice"
          @clear="clearFilters"
        />
      </div>

      <div class="min-w-0">
        <div v-if="visible.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
          <ProductCard v-for="product in visible" :key="product.id" :product="product" />
        </div>
        <div v-else class="surface-card p-10 text-center text-steel">
          با این فیلتر محصولی در این دسته نیست.
          <div class="mt-4">
            <router-link to="/products" class="btn btn-primary">کاتالوگ کامل</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import ProductFilters from '@/components/ProductFilters.vue'
import { useProductStore } from '@/stores/productStore'
import { isPriceOnRequest } from '@/utils/money'
import { colorName } from '@/utils/colors'
import { SORT_OPTIONS, formatCount, sortProducts } from '@/utils/catalogSort'
import { applySeo } from '@/utils/seo'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const filtersOpen = ref(false)
const slug = computed(() => String(route.params.categorySlug || ''))
const selectedSizes = computed(() => listQuery('sizes'))
const selectedColors = computed(() => listQuery('colors'))
const sortMode = computed(() => {
  const value = String(route.query.sort || 'popular')
  return SORT_OPTIONS.some((option) => option.id === value) ? value : 'popular'
})

const scoped = computed(() => store.byCategory(slug.value))
const prices = computed(() => scoped.value.map((item) => Number(item.price) || 0))
const bounds = computed(() => ({
  min: Math.min(...(prices.value.length ? prices.value : [0])),
  max: Math.max(...(prices.value.length ? prices.value : [0])),
}))
const price = computed(() => ({
  min: Number(route.query.min || bounds.value.min),
  max: Number(route.query.max || bounds.value.max),
}))
const availableSizes = computed(() => uniqueOf(scoped.value.flatMap((item) => item.sizes || [])))
const availableColors = computed(() =>
  uniqueOf(scoped.value.flatMap((item) => (item.colors || []).map((color) => colorName(color)))),
)

const visible = computed(() => {
  const filtered = scoped.value.filter((item) => {
    const sizeOk =
      !selectedSizes.value.length || (item.sizes || []).some((size) => selectedSizes.value.includes(size))
    const colorOk =
      !selectedColors.value.length ||
      (item.colors || []).some((color) => selectedColors.value.includes(colorName(color)))
    return sizeOk && colorOk && (isPriceOnRequest(item) || (item.price >= price.value.min && item.price <= price.value.max))
  })
  return sortProducts(filtered, sortMode.value)
})

const title = computed(() => {
  for (const group of store.categories) {
    if (group.slug === slug.value) return group.name
    const child = group.children.find((item) => item.slug === slug.value)
    if (child) return child.name
  }
  return slug.value.replace(/-/g, ' ')
})

const parentGroup = computed(() =>
  store.categories.find(
    (group) => group.slug === slug.value || group.children.some((child) => child.slug === slug.value),
  ),
)
const parentSlug = computed(() => parentGroup.value?.slug || '')
const childLinks = computed(() => parentGroup.value?.children || [])

watch(
  title,
  (value) => {
    applySeo({
      title: value,
      description: `خرید ${value} از فروشگاه تجهیزات ایمنی ایمن یاب.`,
      path: `${import.meta.env.BASE_URL.replace(/\/$/, '')}${route.path}`,
    })
  },
  { immediate: true },
)

function listQuery(key) {
  const raw = route.query[key]
  return raw ? String(raw).split(',').filter(Boolean) : []
}

function uniqueOf(list) {
  return [...new Set(list.filter(Boolean))]
}

function patchQuery(next) {
  const query = { ...route.query, ...next }
  Object.keys(query).forEach((key) => {
    if (query[key] === '' || query[key] == null) delete query[key]
  })
  router.replace({ query })
}

function toggle(key, value) {
  const current = listQuery(key)
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  patchQuery({ [key]: next.join(',') })
}

function setPrice({ min, max }) {
  const nextMin = Math.min(min, max)
  const nextMax = Math.max(min, max)
  patchQuery({
    min: nextMin === bounds.value.min ? undefined : String(nextMin),
    max: nextMax === bounds.value.max ? undefined : String(nextMax),
  })
}

function clearFilters() {
  const next = { ...route.query }
  delete next.sizes
  delete next.colors
  delete next.min
  delete next.max
  router.replace({ query: next })
}

function setSort(value) {
  patchQuery({ sort: value === 'popular' ? undefined : value })
}
</script>

<style scoped>
.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sort-field select {
  min-height: 2.75rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: #fff;
  color: var(--color-ink);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.cat-chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
  scrollbar-width: none;
}

.cat-chips::-webkit-scrollbar {
  display: none;
}

.cat-chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 2.5rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: #fff;
  color: var(--color-ink);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.cat-chip.is-on {
  border-color: var(--color-ember);
  background: color-mix(in srgb, var(--color-ember) 12%, #fff);
  color: var(--color-ember);
}

@media (min-width: 768px) {
  .cat-chips {
    flex-wrap: wrap;
    overflow: visible;
  }
}
</style>
