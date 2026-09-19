<template>
  <div>
    <HeroCinematic />

    <section class="trust-strip" aria-label="مزایای خرید">
      <div class="container-shop trust-strip__grid">
        <div v-for="item in trustPoints" :key="item.title" class="trust-strip__item">
          <span class="trust-strip__icon" aria-hidden="true">
            <i :class="item.icon"></i>
          </span>
          <div>
            <p class="font-bold text-sm">{{ item.title }}</p>
            <p class="text-xs text-steel mt-0.5 leading-5">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-shop cat-section">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-7">
        <h2 class="section-title" v-fade-up>دسته‌بندی تجهیزات</h2>
        <router-link to="/products" class="text-sm text-ember min-h-11 inline-flex items-center">
          همه محصولات
        </router-link>
      </div>
      <div class="cat-grid">
        <router-link
          v-for="group in categoryCards"
          :key="group.slug"
          :to="`/products/category/${group.slug}`"
          class="cat-card"
        >
          <span class="cat-card__photo" aria-hidden="true">
            <img
              v-if="group.image"
              :src="asset(group.image)"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <i v-else :class="group.icon"></i>
          </span>
          <span class="cat-card__copy">
            <h3 :title="group.name">{{ group.name }}</h3>
            <p>{{ formatCount(group.count) }} کالا</p>
          </span>
        </router-link>
      </div>
    </section>

    <section class="container-shop py-8 sm:py-10">
      <div class="mb-5 sm:mb-7 flex flex-wrap items-end justify-between gap-3">
        <h2 class="section-title" v-fade-up>پرفروش‌ها</h2>
        <router-link to="/products" class="text-sm text-ember min-h-11 inline-flex items-center">
          مشاهده همه
        </router-link>
      </div>
      <ProductRail :products="spotlight" />
    </section>

    <NewArrivals />

    <LookbookGrid />
    <GuaranteePoster />
    <BrandSlider />

    <section v-if="approvedReviews.length" class="container-shop py-10">
      <div class="mb-7 max-w-2xl">
        <p class="kicker mb-2" v-fade-up>اعتماد</p>
        <h2 class="section-title" v-fade-up>نظر خریداران</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-5">
        <article v-for="review in approvedReviews" :key="review.id" class="surface-card p-5 sm:p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="grid h-12 w-12 place-items-center rounded-full bg-sand text-ember font-bold">
              {{ review.name.slice(0, 1) }}
            </span>
            <div>
              <h3 class="font-bold text-sm">{{ review.name }}</h3>
              <p class="text-[11px] text-steel leading-5">خریدار تاییدشده</p>
            </div>
          </div>
          <p class="text-ember text-[11px] mb-2" :aria-label="`امتیاز ${review.rating} از ۵`">
            <i
              v-for="star in 5"
              :key="star"
              :class="star <= review.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'"
              aria-hidden="true"
            ></i>
          </p>
          <p class="text-sm leading-7 text-steel mb-3">{{ review.text }}</p>
          <p class="text-[11px] text-steel">
            خرید {{ review.product }} · {{ review.city }} · {{ review.date }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HeroCinematic from '@/components/HeroCinematic.vue'
import NewArrivals from '@/components/NewArrivals.vue'
import ProductRail from '@/components/ProductRail.vue'
import LookbookGrid from '@/components/LookbookGrid.vue'
import GuaranteePoster from '@/components/GuaranteePoster.vue'
import BrandSlider from '@/components/BrandSlider.vue'
import { useProductStore } from '@/stores/productStore'
import { useReviewStore } from '@/stores/reviewStore'
import { asset } from '@/utils/asset'

const products = useProductStore()
const reviews = useReviewStore()

const categoryCards = computed(() =>
  products.categories.map((group) => {
    const items = products.products.filter((item) => item.category === group.name && item.image)
    return {
      ...group,
      count: items.length,
      image: group.image || items[0]?.image || '',
    }
  }),
)

function formatCount(value) {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function hasImage(product) {
  return Boolean(product?.image)
}

const spotlight = computed(() => {
  const featured = products.featured.filter(hasImage)
  const popular = products.popular.filter(hasImage)
  const merged = []
  const seen = new Set()
  for (const item of [...featured, ...popular, ...products.products.filter(hasImage)]) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    merged.push(item)
    if (merged.length >= 12) break
  }
  return merged
})

const approvedReviews = computed(() => reviews.approved.slice(0, 3))

const trustPoints = [
  { icon: 'fa-solid fa-headset', title: 'مشاوره خرید', text: 'راهنمایی انتخاب تجهیزات' },
  { icon: 'fa-solid fa-certificate', title: 'اصالت و ضمانت کالا', text: 'تجهیزات استاندارد ایمنی' },
  { icon: 'fa-solid fa-lock', title: 'پرداخت امن', text: 'کارت‌به‌کارت با تایید رسید' },
  { icon: 'fa-solid fa-truck-fast', title: 'ارسال سریع', text: 'تهران پیک · شهرستان ۳–۷ روز' },
]
</script>

<style scoped>
.trust-strip {
  border-block: 1px solid var(--color-line);
  background: color-mix(in srgb, var(--color-bone) 88%, #fff);
}

.trust-strip__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding-block: 1rem;
}

.trust-strip__item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-height: 3.25rem;
}

.trust-strip__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-ember) 12%, #fff);
  color: var(--color-ember);
  font-size: 0.9rem;
}

@media (min-width: 900px) {
  .trust-strip__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-block: 1.15rem;
    gap: 1rem;
  }
}

.cat-section {
  padding-block: 1.75rem 2.75rem;
}

.cat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cat-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;
  min-width: 0;
  min-height: 0;
  padding: 0.7rem 0.65rem 0.8rem;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: #fff;
  color: var(--color-ink);
  text-decoration: none;
  text-align: center;
  box-shadow: 0 1px 0 rgba(12, 14, 18, 0.04);
  transition:
    background 220ms cubic-bezier(0.2, 0, 0, 1),
    border-color 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms cubic-bezier(0.2, 0, 0, 1),
    transform 180ms cubic-bezier(0.2, 0, 0, 1);
}

.cat-card__photo {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.cat-card__photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 0.4rem;
}

.cat-card__photo i {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-ember);
  font-size: 1.15rem;
}

.cat-card__copy {
  min-width: 0;
  flex: 1;
}

.cat-card__copy h3 {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: 0;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cat-card__copy p {
  margin: 0.15rem 0 0;
  color: var(--color-ash);
  font-size: 0.74rem;
}

.cat-card:hover,
.cat-card:focus-visible {
  background: color-mix(in srgb, var(--color-ember) 11%, #fff);
  border-color: color-mix(in srgb, var(--color-ember) 42%, var(--color-line));
  box-shadow: 0 16px 34px rgba(28, 25, 22, 0.14);
}

.cat-card:focus-visible {
  outline: 2px solid var(--color-ember);
  outline-offset: 2px;
}

.cat-card:active {
  transform: scale(0.98);
}

@media (min-width: 900px) {
  .cat-section {
    padding-block: 2.25rem 2.5rem;
  }

  .cat-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .cat-card {
    flex-direction: row;
    align-items: center;
    text-align: start;
    min-height: 7.25rem;
    padding: 0.9rem 1rem 0.9rem 0.7rem;
    gap: 0.9rem;
  }

  .cat-card__photo {
    width: 6.75rem;
    height: 6.75rem;
    aspect-ratio: auto;
    border-radius: 14px;
  }

  .cat-card__copy h3 {
    font-size: 0.92rem;
    -webkit-line-clamp: 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cat-card,
  .cat-card:active {
    transition: none;
    transform: none;
  }
}
</style>
