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
            fetchpriority="high"
            decoding="async"
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
            <img :src="asset(img)" alt="" class="w-full h-full object-contain p-1" loading="lazy" decoding="async" />
          </button>
        </div>
      </div>

      <div class="surface-card p-5 sm:p-6 space-y-5">
        <div>
          <p class="text-xs text-ember mb-1">{{ product.category }} · {{ product.subcategory }}</p>
          <h1 class="text-2xl sm:text-3xl font-extrabold leading-9">{{ product.title }}</h1>
        </div>

        <div class="rounded-2xl bg-sand/70 px-4 py-3">
          <p class="text-2xl font-bold">{{ displayPrice(product) }}</p>
          <p class="text-xs text-steel mt-1">
            <template v-if="isPriceOnRequest(product)">برای اعلام قیمت و موجودی با فروشگاه تماس بگیرید.</template>
            <template v-else>
              پرداخت کارت‌به‌کارت ·
              {{ outOfStock ? 'ناموجود' : `موجودی ${product.stock} عدد` }}
            </template>
          </p>
        </div>

        <ul v-if="product.features?.length" class="product-features" aria-label="ویژگی‌های محصول">
          <li v-for="feature in product.features" :key="feature">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
            <span>{{ feature }}</span>
          </li>
        </ul>

        <div>
          <label class="block text-sm mb-2" for="product-size">سایز</label>
          <select
            id="product-size"
            v-model="size"
            class="w-full min-h-11 rounded-xl border border-[#ddd4c8] px-3 py-2.5 bg-white"
          >
            <option v-for="item in product.sizes" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <template v-if="isPriceOnRequest(product)">
            <button class="btn btn-primary min-h-11" type="button" @click="contact.openWidget(product)">
              جهت خرید تماس بگیرید
            </button>
          </template>
          <template v-else>
            <label class="text-sm" for="product-qty">تعداد</label>
            <input
              id="product-qty"
              v-model.number="quantity"
              type="number"
              min="1"
              :max="product.stock || 1"
              inputmode="numeric"
              class="w-20 min-h-11 rounded-xl border border-[#ddd4c8] px-3 py-2.5"
            />
            <button class="btn btn-primary" type="button" :disabled="outOfStock" @click="add">
              {{ outOfStock ? 'ناموجود' : 'افزودن به سبد' }}
            </button>
          </template>
          <button class="btn btn-ghost" type="button" @click="contact.openWidget(product)">
            مشاوره این محصول
          </button>
        </div>

        <ul class="product-trust" aria-label="تعهد فروشگاه">
          <li v-for="item in productTrust" :key="item.title">
            <span class="product-trust__icon">
              <i :class="item.icon" aria-hidden="true"></i>
            </span>
            <span class="product-trust__copy">
              <strong>{{ item.title }}</strong>
              <em>{{ item.subtitle }}</em>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <section class="surface-card p-5 sm:p-6 mt-6">
      <h2 class="font-bold mb-3">درباره محصول</h2>
      <p class="leading-8 text-steel text-sm sm:text-base">{{ product.description }}</p>
      <h3 class="font-bold mt-6 mb-2">مشخصات</h3>
      <dl class="spec-table">
        <div v-for="row in specs" :key="row.label" class="spec-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
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
  <section v-else class="container-shop py-20 text-center">
    <p class="font-bold mb-2">این محصول در کاتالوگ نیست</p>
    <p class="text-sm text-steel mb-5">لینک ممکن است قدیمی باشد. از کاتالوگ دوباره انتخاب کنید.</p>
    <router-link to="/products" class="btn btn-primary min-h-11">بازگشت به کاتالوگ</router-link>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { asset } from '@/utils/asset'
import { displayPrice, isPriceOnRequest } from '@/utils/money'
import { applySeo, productJsonLd, setJsonLd, absoluteUrl } from '@/utils/seo'
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
  { icon: 'fa-solid fa-truck', title: 'حمل و نقل', subtitle: 'ارسال مرسوله' },
  { icon: 'fa-solid fa-rotate-left', title: 'بازپرداخت پول', subtitle: 'ضمانت ۳۰ روزه' },
  { icon: 'fa-solid fa-headset', title: 'پشتیبانی ۲۴ ساعته', subtitle: 'در تمام روزهای هفته' },
  { icon: 'fa-solid fa-shield-halved', title: 'امنیت پرداخت', subtitle: 'توسط کلیه کارت‌ها' },
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

    if (!value) {
      applySeo({ title: 'محصول پیدا نشد', noIndex: true, path: route.fullPath })
      setJsonLd('product-jsonld', null)
      return
    }

    const pagePath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${route.path}`
    applySeo({
      title: value.title,
      description: value.description || `${value.title} — خرید از ایمن یاب`,
      path: pagePath,
      image: asset(value.image),
      type: 'product',
    })
    setJsonLd('product-jsonld', productJsonLd(value, absoluteUrl(pagePath)))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  setJsonLd('product-jsonld', null)
})

function add() {
  if (!product.value) {
    toast.error('این کالا فعلاً موجود نیست')
    return
  }
  if (isPriceOnRequest(product.value)) {
    contact.openWidget(product.value)
    return
  }
  if (outOfStock.value) {
    toast.error('این کالا فعلاً موجود نیست')
    return
  }
  const qty = Math.min(Math.max(1, Number(quantity.value) || 1), Number(product.value.stock) || 1)
  cart.addToCart({ ...product.value, size: size.value, quantity: qty })
  toast.success('محصول به سبد اضافه شد')
}

</script>

<style scoped>
.product-features {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-ink, #1c1916);
}

.product-features i {
  margin-top: 0.4rem;
  font-size: 0.7rem;
  color: var(--color-ember, #c45c26);
}

.product-trust {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-trust li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-height: 4.25rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid var(--color-line, #ddd4c8);
  border-radius: 1rem;
  background: #fff;
}

.product-trust__icon {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.7rem;
  background: var(--color-sand, #efe6d8);
  color: var(--color-ember, #c45c26);
  font-size: 0.85rem;
}

.product-trust__copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.product-trust__copy strong {
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.45;
}

.product-trust__copy em {
  font-style: normal;
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--color-ash, #6b6560);
}

@media (min-width: 1024px) {
  .product-trust {
    grid-template-columns: 1fr 1fr;
  }
}

.spec-table {
  display: grid;
  margin: 0;
  border: 1px solid var(--color-line, #d9d0c3);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.spec-row {
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  gap: 1rem;
  margin: 0;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--color-line, #d9d0c3);
}

.spec-row:nth-child(odd) {
  background: #faf8f4;
}

.spec-row:last-child {
  border-bottom: 0;
}

.spec-row dt {
  flex: 0 0 8rem;
  width: 8rem;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-ash, #6b6560);
}

.spec-row dd {
  flex: 0 1 auto;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.55;
  text-align: start;
}
</style>
