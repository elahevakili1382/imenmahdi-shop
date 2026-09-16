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

    <section class="container-shop py-8 sm:py-12">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-7">
        <div>
          <p class="kicker mb-2" v-fade-up>دسته‌بندی</p>
          <h2 class="section-title" v-fade-up>انتخاب دسته تجهیزات</h2>
        </div>
        <router-link to="/products" class="text-sm text-ember min-h-11 inline-flex items-center">
          همه محصولات
        </router-link>
      </div>
      <div
        class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory overscroll-x-contain sm:grid sm:grid-cols-3 sm:overflow-hidden lg:grid-cols-5"
      >
        <router-link
          v-for="group in categoryTree"
          :key="group.slug"
          :to="`/products/category/${group.slug}`"
          class="group flex w-[148px] shrink-0 snap-start flex-col justify-between rounded-2xl bg-night text-stone min-h-[148px] p-3 sm:w-auto sm:min-h-[168px] sm:rounded-3xl sm:p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span
            class="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-copper group-hover:bg-ember group-hover:text-white"
          >
            <i :class="group.icon" aria-hidden="true"></i>
          </span>
          <div>
            <h3 class="font-bold mb-0.5 leading-6 text-sm sm:text-base">{{ group.name }}</h3>
            <p class="text-xs sm:text-sm text-white/50">{{ group.children.length }} زیرگروه</p>
          </div>
        </router-link>
      </div>
    </section>

    <section class="container-shop py-8 sm:py-10">
      <div class="mb-5 sm:mb-7 flex flex-wrap items-end justify-between gap-3">
        <div class="max-w-2xl">
          <p class="kicker mb-2" v-fade-up>منتخب</p>
          <h2 class="section-title" v-fade-up>محصولات آماده سفارش</h2>
        </div>
        <router-link to="/products" class="text-sm text-ember min-h-11 inline-flex items-center">
          مشاهده کاتالوگ
        </router-link>
      </div>
      <ProductRail :products="spotlight" />
    </section>

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
          <p class="text-ember text-[11px] mb-2">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</p>
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
import ProductRail from '@/components/ProductRail.vue'
import LookbookGrid from '@/components/LookbookGrid.vue'
import GuaranteePoster from '@/components/GuaranteePoster.vue'
import BrandSlider from '@/components/BrandSlider.vue'
import { categoryTree } from '@/data/catalog'
import { useProductStore } from '@/stores/productStore'
import { useReviewStore } from '@/stores/reviewStore'

const products = useProductStore()
const reviews = useReviewStore()

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
    if (merged.length >= 8) break
  }
  return merged
})

const approvedReviews = computed(() => reviews.approved.slice(0, 3))

const trustPoints = [
  { icon: 'fa-solid fa-credit-card', title: 'کارت‌به‌کارت', text: 'پرداخت امن با تایید رسید' },
  { icon: 'fa-solid fa-truck-fast', title: 'ارسال سریع', text: 'تهران پیک · شهرستان ۳–۷ روز' },
  { icon: 'fa-solid fa-certificate', title: 'اصالت کالا', text: 'تجهیزات استاندارد ایمنی' },
  { icon: 'fa-solid fa-headset', title: 'مشاوره خرید', text: 'راهنمایی انتخاب تجهیزات' },
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
</style>
