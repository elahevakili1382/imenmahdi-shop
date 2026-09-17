<template>
  <section class="container-shop py-8 sm:py-10 min-w-0">
    <p class="text-sm text-steel mb-2">کاتالوگ</p>
    <h1 class="text-2xl sm:text-3xl font-bold mb-2">همه محصولات</h1>
    <p class="text-sm text-steel mb-6">
      <template v-if="query">نتایج جستجو برای «{{ query }}» · </template>
      {{ visible.length }} کالا
    </p>

    <div class="lg:hidden mb-4">
      <button class="btn btn-dark min-h-11 text-sm w-full sm:w-auto" type="button" @click="filtersOpen = !filtersOpen">
        {{ filtersOpen ? 'بستن فیلتر' : 'فیلترها' }}
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <div class="lg:sticky lg:top-24 lg:self-start" :class="filtersOpen ? 'block' : 'hidden lg:block'">
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

      <div class="min-w-0">
        <div
          v-if="visible.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5"
        >
          <ProductCard v-for="product in visible" :key="product.id" :product="product" />
        </div>
        <div v-else class="surface-card py-14 px-6 text-center">
          <p class="font-bold mb-2">
            {{ query ? `برای «${query}» کالایی پیدا نشد.` : 'با این فیلتر محصولی نیست.' }}
          </p>
          <p class="text-sm text-steel leading-7 mb-5">جستجو یا فیلتر را عوض کنید تا کالاهای موجود دیده شوند.</p>
          <button class="btn btn-primary min-h-11" type="button" @click="resetCatalog">
            پاک کردن جستجو و فیلتر
          </button>
        </div>
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
import { isPriceOnRequest } from '@/utils/money'

const store = useProductStore()
const route = useRoute()
const router = useRouter()
const filtersOpen = ref(false)

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
  list = list.filter(
    (item) =>
      isPriceOnRequest(item) || (item.price >= price.value.min && item.price <= price.value.max),
  )
  list.sort((a, b) => Number(Boolean(b.hero || b.popular)) - Number(Boolean(a.hero || a.popular)))
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

function resetCatalog() {
  router.replace({ query: {} })
}
</script>
