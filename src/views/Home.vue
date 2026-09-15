<template>
  <div>
    <HeroCinematic />

    <section class="container-shop py-8 sm:py-12">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-7">
        <div>
          <p class="kicker mb-2" v-fade-up>دسته‌بندی</p>
          <h2 class="section-title" v-fade-up>برای خط تولید و عملیات</h2>
        </div>
        <router-link to="/products" class="text-sm text-ember">همه محصولات</router-link>
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
      <div class="mb-5 sm:mb-8 max-w-2xl">
        <p class="kicker mb-2" v-fade-up>مسیر خرید</p>
        <h2 class="section-title" v-fade-up>از مشاوره تا ارسال تهران و شهرستان</h2>
      </div>
      <ol
        class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory overscroll-x-contain sm:grid sm:grid-cols-2 sm:overflow-hidden lg:grid-cols-4"
      >
        <li
          v-for="(step, i) in steps"
          :key="step.title"
          class="surface-card relative flex w-[220px] shrink-0 snap-start flex-col p-4 min-h-0 sm:w-auto sm:p-5"
        >
          <span
            class="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-sand text-ember"
            aria-hidden="true"
          >
            <i :class="step.icon" aria-hidden="true"></i>
          </span>
          <p class="text-[11px] text-copper mb-1">گام {{ step.kicker }}</p>
          <h3 class="font-bold mb-1 text-sm sm:text-base">{{ step.title }}</h3>
          <p class="text-xs sm:text-sm text-steel leading-6 sm:leading-7">{{ step.text }}</p>
          <span
            v-if="i < steps.length - 1"
            class="hidden lg:block absolute top-10 -left-2 text-copper/40"
            aria-hidden="true"
          >
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </span>
        </li>
      </ol>
    </section>

    <section class="container-shop py-10">
      <h2 class="section-title mb-7" v-fade-up>منتخب فروشگاه</h2>
      <ProductRail :products="featured" />
    </section>

    <section class="container-shop py-10">
      <h2 class="section-title mb-7" v-fade-up>پرفروش‌ها</h2>
      <ProductRail :products="popular" />
    </section>

    <LookbookGrid />
    <GuaranteePoster />
    <BrandSlider />

    <section class="container-shop py-10">
      <h2 class="section-title mb-7" v-fade-up>نظر خریداران</h2>
      <div v-if="!approvedReviews.length" class="surface-card p-6 text-sm leading-7 text-steel">
        <p class="font-semibold text-ink">هنوز نظری ثبت نشده است.</p>
        <p class="mt-1">بعد از خرید می‌توانید تجربه خود را بنویسید.</p>
      </div>
      <div v-else class="grid md:grid-cols-3 gap-5">
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
const featured = computed(() => products.featured.slice(0, 8))
const popular = computed(() => products.popular.slice(0, 8))
const approvedReviews = computed(() => reviews.approved.slice(0, 6))

const steps = [
  {
    kicker: '۰۱',
    icon: 'fa-solid fa-comments',
    title: 'مشاوره محصول',
    text: 'قبل از سفارش، سایز و استاندارد را از بله، واتساپ یا تماس بپرسید.',
  },
  {
    kicker: '۰۲',
    icon: 'fa-solid fa-credit-card',
    title: 'پرداخت کارت‌به‌کارت',
    text: 'شماره کارت در تسویه نمایش داده می‌شود؛ درگاه آنلاین نداریم.',
  },
  {
    kicker: '۰۳',
    icon: 'fa-solid fa-receipt',
    title: 'ارسال رسید واریز',
    text: 'عکس فیش را آپلود می‌کنید. بررسی خودکار و در صورت نیاز توسط ادمین انجام می‌شود.',
  },
  {
    kicker: '۰۴',
    icon: 'fa-solid fa-truck',
    title: 'ارسال بعد از تایید',
    text: 'تهران: روز و ساعت انتخابی شما. شهرستان: ۳ تا ۷ روز کاری با تیپاکس، ماهکس، پست یا باربری.',
  },
]
</script>
