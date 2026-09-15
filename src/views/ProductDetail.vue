<template>
  <section v-if="product" class="container-shop py-8">
    <nav class="text-sm text-steel mb-5 flex flex-wrap gap-x-1 gap-y-1" aria-label="مسیر صفحه">
      <router-link to="/products" class="hover:text-ember">کاتالوگ</router-link>
      <span> / </span>
      <router-link :to="`/products/category/${product.categorySlug}`" class="hover:text-ember">
        {{ product.category }}
      </router-link>
      <span> / {{ product.subcategory }}</span>
    </nav>

    <div class="grid lg:grid-cols-[minmax(0,0.9fr)_1.1fr] gap-6 lg:gap-10 items-start">
      <div class="surface-card p-4 sm:p-5">
        <div class="product-well rounded-2xl p-4 sm:p-6">
          <img
            :src="asset(activeImage)"
            :alt="product.title"
            class="mx-auto h-[240px] sm:h-[300px] w-full object-contain"
          />
        </div>
        <div class="mt-3 flex justify-center gap-2 overflow-x-auto" role="list">
          <button
            v-for="(img, i) in product.gallery"
            :key="img"
            type="button"
            role="listitem"
            class="product-well w-14 h-14 min-w-14 rounded-xl border overflow-hidden cursor-pointer shrink-0"
            :class="activeImage === img ? 'border-ember' : 'border-[#ddd4c8]'"
            :aria-label="`تصویر ${i + 1} از ${product.gallery.length}`"
            :aria-current="activeImage === img ? 'true' : undefined"
            @click="activeImage = img"
          >
            <img :src="asset(img)" alt="" class="w-full h-full object-contain p-1" />
          </button>
        </div>
      </div>

      <div class="surface-card p-5 sm:p-6 space-y-5">
        <div>
          <p class="text-xs text-ember mb-1">{{ product.category }} · {{ product.subcategory }}</p>
          <h1 class="text-2xl sm:text-3xl font-extrabold leading-9">{{ product.title }}</h1>
        </div>

        <div class="rounded-2xl bg-sand/70 px-4 py-3">
          <p class="text-2xl font-bold">{{ formatPrice(product.price) }} تومان</p>
          <p class="text-xs text-steel mt-1">
            پرداخت کارت‌به‌کارت ·
            {{ outOfStock ? 'ناموجود' : `موجودی ${product.stock} عدد` }}
          </p>
        </div>

        <div class="rounded-2xl border border-sand p-4 space-y-3">
          <p class="text-sm font-bold">نحوه ارسال</p>
          <div class="grid sm:grid-cols-2 gap-2 text-sm">
            <p class="rounded-xl bg-bone px-3 py-2.5 leading-6">
              <span class="block text-[11px] text-ember mb-0.5">تهران</span>
              انتخاب روز و بازه ساعت در تسویه
            </p>
            <p class="rounded-xl bg-bone px-3 py-2.5 leading-6">
              <span class="block text-[11px] text-ember mb-0.5">شهرستان</span>
              ۳ تا ۷ روز کاری با تیپاکس، ماهکس یا پست
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm mb-2" for="product-size">سایز</label>
          <select
            id="product-size"
            v-model="size"
            class="w-full rounded-xl border border-[#ddd4c8] px-3 py-2.5 bg-white"
          >
            <option v-for="item in product.sizes" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <label class="text-sm" for="product-qty">تعداد</label>
          <input
            id="product-qty"
            v-model.number="quantity"
            type="number"
            min="1"
            :max="product.stock || 1"
            inputmode="numeric"
            class="w-20 rounded-xl border border-[#ddd4c8] px-3 py-2.5"
          />
          <button class="btn btn-primary" :disabled="outOfStock" @click="add">
            {{ outOfStock ? 'ناموجود' : 'افزودن به سبد' }}
          </button>
          <button class="btn btn-ghost" type="button" @click="contact.openWidget(product)">
            مشاوره این محصول
          </button>
        </div>

        <ul class="grid grid-cols-3 gap-2" aria-label="تعهد ارسال و کیفیت">
          <li
            v-for="item in productTrust"
            :key="item.title"
            class="rounded-2xl border border-sand bg-bone/80 px-2 py-3 text-center"
          >
            <span class="mx-auto mb-1.5 grid h-8 w-8 place-items-center rounded-xl bg-sand text-ember text-sm">
              <i :class="item.icon" aria-hidden="true"></i>
            </span>
            <span class="block text-[11px] sm:text-xs font-semibold leading-5">{{ item.title }}</span>
          </li>
        </ul>
      </div>
    </div>

    <section class="surface-card p-5 sm:p-6 mt-6">
      <h2 class="font-bold mb-3">درباره محصول</h2>
      <p class="leading-8 text-steel text-sm sm:text-base">{{ product.description }}</p>
      <ul
        v-if="product.features?.length"
        class="mt-4 grid gap-2 text-sm sm:text-base text-steel leading-7"
      >
        <li v-for="feature in product.features" :key="feature" class="flex gap-2">
          <i class="fa-solid fa-check mt-1.5 text-ember text-xs" aria-hidden="true"></i>
          <span>{{ feature }}</span>
        </li>
      </ul>
      <h3 class="font-bold mt-6 mb-3">مشخصات</h3>
      <dl class="grid sm:grid-cols-2 gap-2 text-sm">
        <div v-for="row in specs" :key="row.label" class="rounded-xl bg-bone px-3 py-2.5 flex justify-between gap-3">
          <dt class="text-steel">{{ row.label }}</dt>
          <dd class="font-semibold text-end">{{ row.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="related.length" class="mt-8">
      <h2 class="section-title mb-5">کالاهای مرتبط</h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="item in related" :key="item.id" :product="item" />
      </div>
    </section>
  </section>
  <section v-else class="container-shop py-20 text-center">محصول پیدا نشد.</section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { asset } from '@/utils/asset'
import { formatPrice } from '@/utils/money'
import { useToast } from 'vue-toastification'
import { useContactStore } from '@/stores/contactStore'

const route = useRoute()
const store = useProductStore()
const cart = useCartStore()
const toast = useToast()
const contact = useContactStore()

const product = computed(() => store.bySlug(route.params.slug))
const outOfStock = computed(() => Number(product.value?.stock) <= 0)
const activeImage = ref('')
const size = ref('')
const quantity = ref(1)

const productTrust = [
  { icon: 'fa-solid fa-city', title: 'تهران: روز دلخواه' },
  { icon: 'fa-solid fa-truck', title: 'شهرستان ۳–۷ روز' },
  { icon: 'fa-solid fa-certificate', title: 'ضمانت اصالت' },
]

const specs = computed(() => {
  const item = product.value
  if (!item) return []
  if (Array.isArray(item.specs) && item.specs.length) return item.specs
  return [
    { label: 'دسته', value: item.category },
    { label: 'زیرگروه', value: item.subcategory },
    { label: 'سایزهای موجود', value: (item.sizes || []).join('، ') || 'یک سایز' },
    { label: 'موجودی', value: outOfStock.value ? 'ناموجود' : `${item.stock} عدد` },
    { label: 'پرداخت', value: 'کارت‌به‌کارت' },
  ]
})

const related = computed(() => {
  if (!product.value) return []
  return store
    .byCategory(product.value.categorySlug)
    .filter((item) => item.id !== product.value.id)
    .slice(0, 4)
})

watch(
  product,
  (value) => {
    activeImage.value = value?.gallery?.[0] || value?.image || ''
    size.value = value?.sizes?.[0] || ''
    quantity.value = 1
  },
  { immediate: true },
)

function add() {
  if (!product.value || outOfStock.value) {
    toast.error('این کالا فعلاً موجود نیست')
    return
  }
  const qty = Math.min(Math.max(1, Number(quantity.value) || 1), Number(product.value.stock) || 1)
  cart.addToCart({ ...product.value, size: size.value, quantity: qty })
  toast.success('محصول به سبد اضافه شد')
}
</script>
