<template>
  <section class="container-shop catalog-page py-8 sm:py-10">
    <div class="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-ember">کاتالوگ</p>
        <h1 class="text-3xl font-bold">همه تجهیزات</h1>
        <p class="text-sm text-steel mt-2">
          <template v-if="query">نتایج جستجو برای «{{ query }}» · </template>
          {{ visible.length }} کالا
        </p>
      </div>
      <label class="catalog-sort">
        <span class="sr-only">مرتب‌سازی</span>
        <select v-model="sort" class="field !py-2.5 !min-h-11">
          <option value="featured">پیشنهادی</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
          <option value="stock">بیشترین موجودی</option>
        </select>
      </label>
    </div>

    <div class="lg:hidden mb-4">
      <button class="btn btn-dark min-h-11 text-sm" type="button" @click="filtersOpen = !filtersOpen">
        {{ filtersOpen ? 'بستن فیلتر' : 'فیلتر سایز، رنگ و قیمت' }}
      </button>
    </div>

    <div class="catalog-layout">
      <div class="catalog-products">
        <div
          v-if="visible.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5"
        >
          <ProductCard v-for="product in visible" :key="product.id" :product="product" />
        </div>
        <p v-else class="text-steel py-16 text-center">
          {{ query ? `برای «${query}» کالایی پیدا نشد.` : 'با این فیلتر محصولی نیست. فیلتر را عوض کنید.' }}
        </p>
      </div>

      <div
        class="catalog-filters lg:sticky lg:top-24 lg:self-start"
        :class="filtersOpen ? 'block' : 'hidden lg:block'"
      >
        <ProductFilters
          :selected-categories="selectedCats"
          :selected-sizes="selectedSizes"
          :selected-colors="selectedColors"
          :available-sizes="availableSizes"
          :available-colors="availableColors"
          :price="price"
          :bounds="bounds"
          @toggle-category="toggle('cats', $event)"
          @toggle-size="toggle('sizes', $event)"
          @toggle-color="toggle('colors', $event)"
          @update-price="setPrice"
          @clear="clearFilters"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import ProductFilters from '@/components/ProductFilters.vue'
import { useProductStore } from '@/stores/productStore'

const store = useProductStore()
const route = useRoute()
const router = useRouter()
const filtersOpen = ref(false)
const sort = ref('featured')

const query = computed(() => String(route.query.q || ''))
const selectedCats = computed(() => listQuery('cats', 'cat'))
const selectedSizes = computed(() => listQuery('sizes'))
const selectedColors = computed(() => listQuery('colors'))

const prices = computed(() => store.products.map((item) => Number(item.price) || 0))
const bounds = computed(() => ({
  min: Math.min(...prices.value, 0),
  max: Math.max(...prices.value, 0),
}))

const price = computed(() => ({
  min: Number(route.query.min || bounds.value.min),
  max: Number(route.query.max || bounds.value.max),
}))

const availableSizes = computed(() => uniqueOf(store.products.flatMap((item) => item.sizes || [])))
const availableColors = computed(() => uniqueOf(store.products.flatMap((item) => item.colors || [])))

const visible = computed(() => {
  let list = query.value ? store.search(query.value) : [...store.products]
  if (selectedCats.value.length) {
    list = list.filter((item) =>
      selectedCats.value.some(
        (slug) => item.categorySlug === slug || item.subcategorySlug === slug,
      ),
    )
  }
  if (selectedSizes.value.length) {
    list = list.filter((item) => (item.sizes || []).some((size) => selectedSizes.value.includes(size)))
  }
  if (selectedColors.value.length) {
    list = list.filter((item) => (item.colors || []).some((color) => selectedColors.value.includes(color)))
  }
  list = list.filter((item) => item.price >= price.value.min && item.price <= price.value.max)

  if (sort.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  else if (sort.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  else if (sort.value === 'stock') list.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
  else list.sort((a, b) => Number(Boolean(b.hero || b.popular)) - Number(Boolean(a.hero || a.popular)))

  return list
})

function listQuery(...keys) {
  for (const key of keys) {
    const raw = route.query[key]
    if (raw) return String(raw).split(',').filter(Boolean)
  }
  return []
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
  const current = listQuery(key, key === 'cats' ? 'cat' : key)
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  const payload = { [key]: next.join(',') }
  if (key === 'cats') payload.cat = undefined
  patchQuery(payload)
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
  delete next.cats
  delete next.cat
  delete next.sizes
  delete next.colors
  delete next.min
  delete next.max
  router.replace({ query: next })
}
</script>

<style scoped>
.catalog-page {
  max-width: 1320px;
}

.catalog-layout {
  display: grid;
  gap: 1.5rem;
}

.catalog-sort {
  min-width: 11rem;
}

@media (min-width: 1024px) {
  .catalog-layout {
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 2rem;
    align-items: start;
  }
}
</style>
