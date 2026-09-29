<template>
  <section v-if="product" class="pd">
    <div class="container-shop pd__inner">
      <nav class="pd-crumb" aria-label="مسیر صفحه">
        <router-link to="/">خانه</router-link>
        <span aria-hidden="true">/</span>
        <router-link to="/products">کاتالوگ</router-link>
        <span aria-hidden="true">/</span>
        <router-link :to="`/products/category/${product.categorySlug}`">{{ product.category }}</router-link>
        <span aria-hidden="true">/</span>
        <span class="pd-crumb__current">{{ product.title }}</span>
      </nav>

      <div class="pd-hero">
        <div class="pd-info">
          <div class="pd-info__meta">
            <span class="pd-stock" :class="outOfStock ? 'is-out' : 'is-in'">
              <i aria-hidden="true"></i>
              {{ stockLine }}
            </span>
            <p v-if="skuText" class="pd-sku">شناسه کالا: <strong>{{ skuText }}</strong></p>
          </div>

          <div class="pd-title-block">
            <h1>{{ product.title }}</h1>
            <p v-if="product.brand" class="pd-brand">{{ product.brand }}</p>
            <p v-if="product.subcategory" class="pd-sub">{{ product.subcategory }}</p>
          </div>

          <div class="pd-price" v-if="!isPriceOnRequest(product)">
            <div class="pd-price__row">
              <strong>{{ displayPrice(product) }}</strong>
              <span v-if="hasDiscount(product)" class="pd-price__badge">٪{{ discountPercent(product) }}</span>
            </div>
            <p v-if="hasDiscount(product)" class="pd-price__was">
              <s>{{ formatPrice(product.price) }} تومان</s>
            </p>
          </div>

          <div v-if="product.sizes?.length" class="pd-size">
            <span class="pd-size__label">سایز</span>
            <div class="pd-size__options" role="listbox" aria-label="انتخاب سایز">
              <button
                v-for="item in product.sizes"
                :key="item"
                type="button"
                role="option"
                class="pd-size__chip"
                :class="{ 'is-active': size === item }"
                :aria-selected="size === item"
                @click="size = item"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <div v-if="colorOptions.length" class="pd-size pd-color-row" aria-label="انتخاب رنگ">
            <span class="pd-size__label">رنگ:</span>
            <div class="pd-size__options">
              <button
                v-for="color in colorOptions"
                :key="color.name"
                type="button"
                class="pd-color-dot"
                :class="{ 'is-active': selectedColor === color.name }"
                :aria-label="color.name"
                :aria-pressed="selectedColor === color.name"
                :title="color.name"
                @click="selectedColor = color.name"
              >
                <span :style="{ background: color.hex }" aria-hidden="true"></span>
              </button>
            </div>
          </div>

          <ul v-if="featureList.length" class="pd-specs" aria-label="مشخصات فنی">
            <li v-for="feature in featureList" :key="feature">
              <i class="fa-solid fa-check" aria-hidden="true"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <div class="pd-actions">
            <template v-if="isPriceOnRequest(product)">
              <button class="pd-btn pd-btn--primary" type="button" @click="contact.openWidget(product)">
                <i class="fa-solid fa-phone" aria-hidden="true"></i>
                جهت خرید تماس بگیرید
              </button>
            </template>
            <template v-else>
              <div class="pd-qty" v-if="!outOfStock">
                <button type="button" aria-label="کاهش تعداد" @click="quantity = Math.max(1, quantity - 1)">−</button>
                <input v-model.number="quantity" type="number" min="1" :max="qtyMax" aria-label="تعداد" />
                <button type="button" aria-label="افزایش تعداد" @click="quantity = Math.min(qtyMax, quantity + 1)">+</button>
              </div>
              <button class="pd-btn pd-btn--primary" type="button" :disabled="outOfStock" @click="add">
                <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                {{ outOfStock ? 'ناموجود' : 'افزودن به سبد' }}
              </button>
              <router-link v-if="inCart" to="/cart" class="pd-btn pd-btn--ghost">مشاهده سبد</router-link>
            </template>
            <button class="pd-btn pd-btn--outline" type="button" @click="contact.openWidget(product)">
              <i class="fa-solid fa-comments" aria-hidden="true"></i>
              مشاوره این محصول
            </button>
          </div>
        </div>

        <div class="pd-gallery">
          <div class="pd-gallery__frame">
            <div class="pd-gallery__badges">
              <span v-if="certBadge" class="pd-gallery__chip">{{ certBadge }}</span>
              <span v-if="product.brand" class="pd-gallery__chip pd-gallery__chip--brand">{{ product.brand }}</span>
            </div>
            <button
              class="pd-gallery__zoom"
              type="button"
              aria-label="بزرگ‌نمایی تصویر"
              @click="lightbox = true"
            >
              <i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>
            </button>
            <img
              :src="asset(activeImage)"
              :alt="product.title"
              class="pd-gallery__img"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div v-if="galleryThumbs.length > 1" class="pd-thumbs" role="list">
            <button
              v-for="(img, i) in galleryThumbs"
              :key="img"
              type="button"
              role="listitem"
              class="pd-thumbs__item"
              :class="{ 'is-active': activeImage === img }"
              :aria-label="`تصویر ${i + 1}`"
              :aria-current="activeImage === img ? 'true' : undefined"
              @click="activeImage = img"
            >
              <img :src="asset(img)" alt="" loading="lazy" decoding="async" />
            </button>
          </div>

          <ul v-if="highlights.length" class="pd-highlights" aria-label="نکات برجسته">
            <li v-for="item in highlights" :key="item">
              <span class="pd-highlights__icon" aria-hidden="true">
                <i class="fa-solid fa-circle-check"></i>
              </span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <ul class="pd-trust" aria-label="تعهد فروشگاه">
        <li v-for="item in productTrust" :key="item.title">
          <span class="pd-trust__icon" aria-hidden="true">
            <i :class="item.icon"></i>
          </span>
          <span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.subtitle }}</em>
          </span>
        </li>
      </ul>

      <section class="pd-about">
        <header class="pd-about__head">
          <span class="pd-about__icon" aria-hidden="true">
            <i class="fa-solid fa-file-lines"></i>
          </span>
          <h2>درباره محصول</h2>
        </header>
        <div class="pd-about__body">
          <p v-for="(para, index) in descriptionParagraphs" :key="index">{{ para }}</p>
          <p v-if="!descriptionParagraphs.length" class="pd-about__empty">توضیحی برای این کالا ثبت نشده است.</p>
        </div>
        <footer class="pd-about__foot">
          <div class="pd-authenticity">
            <span aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></span>
            اصالت و سلامت فیزیکی ۱۰۰٪ کالا
          </div>
          <a
            v-if="product.datasheet"
            class="pd-datasheet"
            :href="asset(product.datasheet)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
            دانلود دیتاشیت (PDF)
          </a>
        </footer>
      </section>

      <section v-if="related.length" class="pd-related">
        <h2>کالاهای مرتبط</h2>
        <div class="pd-related__grid">
          <ProductCard v-for="item in related" :key="item.id" :product="item" />
        </div>
      </section>
    </div>

    <div
      v-if="lightbox"
      class="pd-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="بزرگ‌نمایی تصویر"
      @click.self="lightbox = false"
    >
      <button class="pd-lightbox__close" type="button" aria-label="بستن" @click="lightbox = false">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <img :src="asset(activeImage)" :alt="product.title" />
    </div>
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
import { displayPrice, formatPrice, hasDiscount, discountPercent, isPriceOnRequest } from '@/utils/money'
import { displayStock, isOutOfStock, maxOrderQty } from '@/utils/stock'
import { normalizeColors } from '@/utils/colors'
import { applySeo, productJsonLd, setJsonLd, absoluteUrl } from '@/utils/seo'
import { useToast } from 'vue-toastification'
import { useContactStore } from '@/stores/contactStore'

const route = useRoute()
const store = useProductStore()
const cart = useCartStore()
const toast = useToast()
const contact = useContactStore()

const product = computed(() => store.bySlug(route.params.slug))
const outOfStock = computed(() => isOutOfStock(product.value))
const stockLine = computed(() => displayStock(product.value))
const qtyMax = computed(() => maxOrderQty(product.value) || 1)
const inCart = computed(() => cart.items.some((item) => item.id === product.value?.id))
const activeImage = ref('')
const size = ref('')
const quantity = ref(1)
const selectedColor = ref('')
const lightbox = ref(false)

const productTrust = [
  { icon: 'fa-solid fa-truck-fast', title: 'حمل و نقل', subtitle: 'ارسال سریع مرسوله' },
  { icon: 'fa-solid fa-rotate-left', title: 'بازپرداخت پول', subtitle: 'ضمانت ۳۰ روزه' },
  { icon: 'fa-solid fa-headset', title: 'پشتیبانی ۲۴ ساعته', subtitle: 'در تمام روزهای هفته' },
  { icon: 'fa-solid fa-shield-halved', title: 'امنیت پرداخت', subtitle: 'توسط کلیه کارت‌ها' },
]

const galleryThumbs = computed(() => {
  const list = product.value?.gallery?.length
    ? product.value.gallery
    : product.value?.image
      ? [product.value.image]
      : []
  return [...new Set(list.filter(Boolean))]
})

const skuText = computed(() => {
  const p = product.value
  if (!p) return ''
  return String(p.sku || p.code || p.id || '').trim()
})

const featureList = computed(() =>
  (product.value?.features || []).map((item) => String(item || '').trim()).filter(Boolean),
)

const highlights = computed(() => featureList.value.slice(0, 3))

const colorOptions = computed(() => normalizeColors(product.value?.colors))

const certBadge = computed(() => {
  const hit = featureList.value.find((item) => /EN\s?\d|CE|ISO|ANSI|NFPA/i.test(item))
  if (!hit) return ''
  const match = hit.match(/(EN\s?\d[\w./-]*|CE|ISO\s?\d[\w./-]*|ANSI[\w./-]*|NFPA[\w./-]*)/i)
  return match ? match[0].replace(/\s+/g, ' ').trim() : hit.slice(0, 28)
})

const descriptionParagraphs = computed(() => {
  const text = String(product.value?.description || '').trim()
  if (!text) return []
  return text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
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
    selectedColor.value = normalizeColors(value?.colors)[0]?.name || ''
    lightbox.value = false

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
  const qty = Math.min(Math.max(1, Number(quantity.value) || 1), qtyMax.value)
  cart.addToCart({
    ...product.value,
    size: size.value,
    quantity: qty,
    color: selectedColor.value || undefined,
  })
  toast.success('محصول به سبد اضافه شد')
}
</script>

<style scoped>
.pd {
  background: #f4f6f8;
  padding-block: 1rem 2.5rem;
  min-width: 0;
  overflow-x: clip;
}

.pd__inner {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.pd-crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.45rem;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.6;
}

.pd-crumb a {
  color: #64748b;
  text-decoration: none;
}

.pd-crumb a:hover {
  color: #c2410c;
}

.pd-crumb__current {
  color: #475569;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.pd-hero {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.pd-info,
.pd-gallery,
.pd-about {
  min-width: 0;
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 1.15rem;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
}

.pd-info {
  display: grid;
  gap: 1rem;
  padding: 1.1rem;
  order: 2;
}

.pd-gallery {
  padding: 0.9rem;
  order: 1;
}

.pd-info__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 0.85rem;
}

.pd-stock {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.pd-stock i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
}

.pd-stock.is-in {
  color: #166534;
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
}

.pd-stock.is-in i {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.pd-stock.is-out {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.pd-stock.is-out i {
  background: #ef4444;
}

.pd-sku {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
}

.pd-sku strong {
  color: #0f172a;
  font-weight: 800;
}

.pd-title-block h1 {
  margin: 0;
  font-size: clamp(1.25rem, 4vw, 1.85rem);
  font-weight: 900;
  line-height: 1.45;
  color: #0f172a;
}

.pd-brand {
  margin: 0.4rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 700;
}

.pd-sub {
  margin: 0.2rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.pd-price__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.pd-price strong {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
}

.pd-price__badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.pd-price__was {
  margin: 0.3rem 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
}

.pd-size {
  display: grid;
  gap: 0.5rem;
}

.pd-size__label {
  font-size: 0.82rem;
  font-weight: 800;
  color: #334155;
}

.pd-size__options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.pd-size__chip {
  min-height: 2.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.pd-size__chip.is-active {
  border-color: #ea580c;
  background: #fff7ed;
  color: #9a3412;
}

.pd-color-row {
  align-items: center;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.55rem 0.75rem;
}

.pd-color-row .pd-size__label {
  margin: 0;
}

.pd-color-dot {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
}

.pd-color-dot span {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.pd-color-dot.is-active {
  border-color: #ea580c;
  background: #fff7ed;
}

.pd-specs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem 1rem;
  margin: 0;
  padding: 0.85rem;
  list-style: none;
  border-radius: 0.95rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.pd-specs li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 0.84rem;
  line-height: 1.65;
  color: #1e293b;
}

.pd-specs i {
  margin-top: 0.28rem;
  color: #ea580c;
  font-size: 0.72rem;
}

.pd-actions {
  display: grid;
  gap: 0.55rem;
}

.pd-qty {
  display: inline-grid;
  grid-template-columns: 2.4rem minmax(2.5rem, 1fr) 2.4rem;
  width: min(100%, 9.5rem);
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  overflow: hidden;
  background: #fff;
}

.pd-qty button,
.pd-qty input {
  min-height: 2.75rem;
  border: 0;
  background: transparent;
  color: #0f172a;
  font-weight: 800;
}

.pd-qty input {
  text-align: center;
  font-size: 0.95rem;
}

.pd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  min-height: 3rem;
  padding: 0.7rem 1rem;
  border-radius: 0.9rem;
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: transform 120ms ease-out, background-color 120ms ease-out;
}

.pd-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.pd-btn--primary {
  border: 0;
  background: #ea580c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(234, 88, 12, 0.25);
}

.pd-btn--primary:hover:not(:disabled) {
  background: #c2410c;
}

.pd-btn--primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.pd-btn--outline {
  border: 1.5px solid #fdba74;
  background: #fff;
  color: #c2410c;
}

.pd-btn--outline:hover {
  background: #fff7ed;
}

.pd-btn--ghost {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

.pd-gallery__frame {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 16rem;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.pd-gallery__badges {
  position: absolute;
  top: 0.75rem;
  inset-inline-start: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-width: calc(100% - 3.5rem);
  z-index: 1;
}

.pd-gallery__chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.55rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 800;
}

.pd-gallery__chip--brand {
  color: #c2410c;
}

.pd-gallery__zoom {
  position: absolute;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
}

.pd-gallery__zoom:hover {
  color: #ea580c;
  border-color: #fdba74;
}

.pd-gallery__img {
  width: 100%;
  max-height: 22rem;
  object-fit: contain;
}

.pd-thumbs {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.pd-thumbs__item {
  flex: 0 0 auto;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
}

.pd-thumbs__item.is-active {
  border-color: #ea580c;
}

.pd-thumbs__item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pd-highlights {
  display: grid;
  gap: 0.45rem;
  margin: 0.85rem 0 0;
  padding: 0;
  list-style: none;
}

.pd-highlights li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.85rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.5;
}

.pd-highlights__icon {
  color: #ea580c;
  flex-shrink: 0;
}

.pd-trust {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pd-trust li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.8rem;
  border-radius: 0.95rem;
  border: 1px solid #e5eaf0;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
}

.pd-trust__icon {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: #fff7ed;
  color: #ea580c;
}

.pd-trust strong {
  display: block;
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f172a;
}

.pd-trust em {
  display: block;
  margin-top: 0.15rem;
  font-style: normal;
  font-size: 0.7rem;
  color: #64748b;
  line-height: 1.5;
}

.pd-about {
  padding: 1.1rem;
}

.pd-about__head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}

.pd-about__icon {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.7rem;
  background: #fff7ed;
  color: #ea580c;
}

.pd-about__head h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
  color: #0f172a;
}

.pd-about__body {
  display: grid;
  gap: 0.85rem;
}

.pd-about__body p,
.pd-about__empty {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.95;
}

.pd-about__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.15rem;
  padding-top: 0.95rem;
  border-top: 1px dashed #e2e8f0;
}

.pd-authenticity {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #92400e;
  font-size: 0.82rem;
  font-weight: 800;
}

.pd-authenticity span {
  color: #d97706;
}

.pd-datasheet {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  background: #fff;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 800;
  text-decoration: none;
}

.pd-datasheet:hover {
  background: #fef2f2;
}

.pd-related {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
}

.pd-related h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
}

.pd-related__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.pd-lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.78);
}

.pd-lightbox img {
  max-width: min(92vw, 56rem);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
}

.pd-lightbox__close {
  position: absolute;
  top: 1rem;
  inset-inline-end: 1rem;
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
}

@media (min-width: 640px) {
  .pd-specs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pd-highlights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pd-trust {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .pd-related__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pd-gallery__frame {
    min-height: 20rem;
  }
}

@media (min-width: 900px) {
  .pd {
    padding-block: 1.5rem 3rem;
  }

  .pd__inner {
    gap: 1.25rem;
  }

  .pd-hero {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    align-items: start;
    gap: 1.25rem;
  }

  .pd-info {
    order: 0;
    padding: 1.35rem 1.4rem;
  }

  .pd-gallery {
    order: 0;
    padding: 1.1rem;
    position: sticky;
    top: 5.5rem;
  }

  .pd-actions {
    grid-template-columns: 1fr;
  }

  .pd-related__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .pd-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  }
}
</style>
