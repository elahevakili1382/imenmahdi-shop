<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { asset } from '@/utils/asset'
import { displayPrice, formatPrice, hasDiscount, discountPercent, isPriceOnRequest } from '@/utils/money'
import { isOutOfStock } from '@/utils/stock'
import { normalizeColors } from '@/utils/colors'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from 'vue-toastification'

const props = defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()
const toast = useToast()
const router = useRouter()
const broken = ref(false)
const outOfStock = computed(() => isOutOfStock(props.product))
const stockLabel = computed(() =>
  outOfStock.value ? 'ناموجود' : 'موجود در انبار فروشگاه',
)
const addLabel = computed(() => (outOfStock.value ? 'ناموجود' : 'افزودن به سبد'))
const imageSrc = computed(() => (broken.value ? '' : asset(props.product.image)))
const colorDots = computed(() => normalizeColors(props.product.colors).slice(0, 6))

function add() {
  if (isPriceOnRequest(props.product)) {
    router.push(`/products/${props.product.slug}`)
    return
  }
  if (outOfStock.value) {
    toast.error('این کالا فعلاً موجود نیست')
    return
  }
  cart.addToCart({ ...props.product, size: props.product.sizes?.[0] })
  toast.success('به سبد اضافه شد')
}

function onImageError() {
  broken.value = true
}
</script>

<template>
  <article
    class="product-card"
    :class="{ 'product-card--out': outOfStock }"
  >
    <router-link :to="`/products/${product.slug}`" class="product-card__link">
      <div class="product-card__media">
        <img
          v-if="imageSrc"
          :src="imageSrc"
          :alt="product.title"
          loading="lazy"
          decoding="async"
          class="product-card__img"
          @error="onImageError"
        />
        <div v-else class="product-card__fallback" aria-hidden="true">
          <i class="fa-regular fa-image"></i>
          <span>بدون تصویر</span>
        </div>
        <span
          class="product-card__stock"
          :class="outOfStock ? 'product-card__stock--out' : 'product-card__stock--in'"
        >
          <span
            class="product-card__live"
            :class="outOfStock ? 'product-card__live--off' : 'product-card__live--on'"
            aria-hidden="true"
          />
          {{ stockLabel }}
        </span>
        <span v-if="hasDiscount(product)" class="product-card__discount">
          ٪{{ discountPercent(product) }}
        </span>
        <span
          v-if="product.badge"
          class="product-card__badge"
          :class="{ 'product-card__badge--offset': hasDiscount(product) }"
        >
          {{ product.badge }}
        </span>
      </div>

      <div class="product-card__body">
        <p class="product-card__meta">{{ product.brand || product.subcategory }}</p>
        <h3 class="product-card__title">{{ product.title }}</h3>
        <div v-if="colorDots.length" class="product-card__colors" aria-label="رنگ‌های موجود">
          <span
            v-for="color in colorDots"
            :key="color.name"
            class="product-card__swatch"
            :style="{ background: color.hex }"
            :title="color.name"
          />
        </div>
        <div class="product-card__price-wrap">
          <strong class="product-card__price">{{ displayPrice(product) }}</strong>
          <p v-if="hasDiscount(product)" class="product-card__was">
            <s>{{ formatPrice(product.price) }} تومان</s>
          </p>
        </div>
      </div>
    </router-link>

    <div class="product-card__actions">
      <button
        class="product-card__cart"
        type="button"
        :disabled="outOfStock"
        :aria-label="addLabel"
        @click="add"
      >
        <template v-if="outOfStock">ناموجود</template>
        <template v-else>
          <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
          <span>افزودن به سبد</span>
        </template>
      </button>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid #e8edf2;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.product-card:hover {
  border-color: #dbe3ec;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.product-card--out {
  filter: grayscale(1);
  opacity: 0.72;
  background: #f1f5f9;
}

.product-card__link {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  text-decoration: none;
  color: inherit;
}

.product-card__media {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: transparent;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.85rem;
  transition: transform 220ms ease;
}

.product-card__link:hover .product-card__img {
  transform: scale(1.03);
}

.product-card__fallback {
  display: grid;
  place-content: center;
  gap: 0.35rem;
  height: 100%;
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
}

.product-card__fallback i {
  font-size: 1.35rem;
  opacity: 0.55;
}

.product-card__stock {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: calc(100% - 1.1rem);
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1.35;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.product-card__live {
  width: 0.45rem;
  height: 0.45rem;
  flex-shrink: 0;
  border-radius: 50%;
}

.product-card__live--on {
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  animation: stock-live-pulse 1.6s ease-out infinite;
}

.product-card__live--off {
  background: #94a3b8;
}

.product-card__stock--in {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.product-card__stock--out {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.product-card__discount,
.product-card__badge {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.3;
  color: #fff;
}

.product-card__discount {
  background: #ea580c;
}

.product-card__badge {
  background: #0f172a;
}

.product-card__badge--offset {
  top: 2.15rem;
}

.product-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.3rem;
  padding: 0.85rem 0.85rem 0.55rem;
}

.product-card__meta {
  margin: 0;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.35;
}

.product-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.55;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card__colors {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.15rem;
}

.product-card__swatch {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.product-card__price-wrap {
  margin-top: auto;
  padding-top: 0.45rem;
}

.product-card__price {
  display: block;
  color: #ea580c;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.35;
}

.product-card__was {
  margin: 0.15rem 0 0;
  color: #94a3b8;
  font-size: 0.68rem;
}

.product-card__actions {
  padding: 0 0.85rem 0.85rem;
}

.product-card__cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  min-height: 2.55rem;
  padding: 0.55rem 0.85rem;
  border: 0;
  border-radius: 0.75rem;
  background: #0f172a;
  color: #f8fafc;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.product-card__cart i {
  font-size: 0.82rem;
}

.product-card__cart:hover:not(:disabled),
.product-card__cart:focus-visible:not(:disabled) {
  background: #ea580c;
  box-shadow: 0 10px 20px rgba(234, 88, 12, 0.28);
  transform: translateY(-1px);
}

.product-card__cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #94a3b8;
}

@keyframes stock-live-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  70% {
    box-shadow: 0 0 0 0.45rem rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@media (min-width: 640px) {
  .product-card__title {
    font-size: 0.9rem;
  }

  .product-card__price {
    font-size: 0.95rem;
  }

  .product-card__img {
    padding: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-card__img,
  .product-card__cart,
  .product-card__live--on {
    transition: none;
    animation: none;
    transform: none;
  }
}
</style>
