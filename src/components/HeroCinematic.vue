<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { asset } from '@/utils/asset'
import { useContentStore } from '@/stores/contentStore'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const content = useContentStore()
const slides = computed(() => content.heroSlides)
const modules = [Autoplay, EffectFade, Pagination]
const reduceMotion = ref(false)
const swiperRef = ref(null)

const trustCard = [
  { icon: 'fa-solid fa-industry', title: 'استاندارد کالا', text: 'EN 397 · CE / ANSI' },
  { icon: 'fa-solid fa-certificate', title: 'اصالت کالا', text: 'برندهای معتبر ایمنی' },
  { icon: 'fa-solid fa-clipboard-check', title: 'کنترل پیش از ارسال', text: 'فعال برای هر سفارش' },
  { icon: 'fa-solid fa-file-invoice', title: 'صدور پیش‌فاکتور', text: 'رسمی و معتبر برای سازمان' },
]

const heroHighlights = [
  {
    icon: 'fa-solid fa-box',
    tone: 'orange',
    title: '+۵۰۰۰ قلم',
    text: 'موجود در انبار مرکزی',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    tone: 'green',
    title: 'تأییدیه رسمی',
    text: 'سازمان آتش‌نشانی',
  },
  {
    icon: 'fa-solid fa-bolt',
    tone: 'amber',
    title: 'ارسال ۲۴ ساعته',
    text: 'سراسر کارخانجات کشور',
  },
]

function onSwiper(instance) {
  swiperRef.value = instance
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => {
  swiperRef.value = null
})

watch(
  () => slides.value.length,
  () => {
    swiperRef.value?.update?.()
  },
)
</script>

<template>
  <section class="stitch-hero" aria-roledescription="carousel" aria-label="بنر فروشگاه">
    <Swiper
      class="stitch-hero__swiper"
      dir="rtl"
      :modules="modules"
      :slides-per-view="1"
      :loop="slides.length > 1"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :speed="700"
      :autoplay="
        reduceMotion || slides.length < 2
          ? false
          : { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }
      "
      :pagination="{ clickable: true }"
      @swiper="onSwiper"
    >
      <SwiperSlide v-for="(slide, i) in slides" :key="`${i}-${slide.headline}`">
        <div class="stitch-hero__slide">
          <img
            class="stitch-hero__bg"
            :class="slide.focus"
            :src="asset(slide.image)"
            :alt="slide.headline"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'low'"
            decoding="async"
          />
          <div class="stitch-hero__shade" aria-hidden="true" />

          <div class="container-shop stitch-hero__inner">
            <div class="stitch-hero__copy">
              <p class="stitch-hero__kicker">
                <span>{{ slide.kicker || 'ایمن یاب' }}</span>
              </p>
              <h1>{{ slide.headline }}</h1>
              <p class="stitch-hero__text">{{ slide.copy }}</p>

              <div class="stitch-hero__actions">
                <router-link to="/products" class="stitch-hero__cta">
                  <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
                  <span>مشاهده محصولات</span>
                </router-link>
                <router-link to="/contact" class="stitch-hero__ghost">
                  <i class="fa-solid fa-file-invoice" aria-hidden="true"></i>
                  <span class="stitch-hero__ghost-sm">استعلام قیمت</span>
                  <span class="stitch-hero__ghost-lg">استعلام فوری قیمت سازمانی</span>
                </router-link>
              </div>

              <div class="stitch-hero__highlights">
                <div v-for="item in heroHighlights" :key="item.title" class="stitch-hero__highlight">
                  <span class="stitch-hero__highlight-icon" :class="`is-${item.tone}`" aria-hidden="true">
                    <i :class="item.icon"></i>
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <em>{{ item.text }}</em>
                  </span>
                </div>
              </div>
            </div>

            <aside class="stitch-hero__panel" aria-label="مزایای خرید از ایمن یاب">
              <p class="stitch-hero__panel-lead">تجهیز کامل کارگاه‌های پتروشیمی و صنعتی</p>
              <p class="stitch-hero__panel-title">انتخاب مطمئن پروژه‌های بزرگ</p>
              <ul>
                <li v-for="item in trustCard" :key="item.title">
                  <span class="stitch-hero__panel-icon" aria-hidden="true">
                    <i :class="item.icon"></i>
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <em>{{ item.text }}</em>
                  </span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped>
.stitch-hero {
  position: relative;
  background: #0b1220;
  color: #f8fafc;
}

.stitch-hero__swiper {
  width: 100%;
}

.stitch-hero__slide {
  position: relative;
  min-height: clamp(22rem, 58vh, 28rem);
  overflow: hidden;
}

.stitch-hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.04);
}

.stitch-hero__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(8, 14, 28, 0.45) 0%, rgba(8, 14, 28, 0.82) 100%),
    linear-gradient(100deg, rgba(8, 14, 28, 0.88) 8%, rgba(8, 14, 28, 0.4) 70%, rgba(8, 14, 28, 0.2) 100%);
}

.stitch-hero__inner {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 1rem;
  align-items: end;
  min-height: clamp(22rem, 58vh, 28rem);
  padding-block: 4.75rem 3.25rem;
}

.stitch-hero__copy {
  max-width: 40rem;
}

.stitch-hero__kicker {
  display: inline-flex;
  margin: 0 0 0.65rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(196, 92, 38, 0.18);
  border: 1px solid rgba(249, 115, 22, 0.35);
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
}

.stitch-hero__copy h1 {
  margin: 0;
  font-size: clamp(1.45rem, 6.5vw, 2.85rem);
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.stitch-hero__text {
  display: none;
  margin: 1rem 0 0;
  max-width: 34rem;
  color: rgba(248, 250, 252, 0.78);
  font-size: 0.95rem;
  line-height: 1.9;
}

.stitch-hero__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-top: 1.05rem;
}

.stitch-hero__cta,
.stitch-hero__ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.stitch-hero__cta {
  background: #ea580c;
  color: #fff;
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.32);
}

.stitch-hero__cta:hover {
  background: #c2410c;
}

.stitch-hero__ghost {
  border: 1.5px solid #ea580c;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;
}

.stitch-hero__ghost:hover {
  background: rgba(234, 88, 12, 0.12);
}

.stitch-hero__ghost i {
  color: #fb923c;
}

.stitch-hero__ghost-lg {
  display: none;
}

.stitch-hero__highlights,
.stitch-hero__panel {
  display: none;
}

.stitch-hero__highlight {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.85rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.stitch-hero__highlight strong {
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.3;
}

.stitch-hero__highlight em {
  display: block;
  margin-top: 0.1rem;
  font-style: normal;
  font-size: 0.66rem;
  color: rgba(248, 250, 252, 0.62);
  line-height: 1.4;
}

.stitch-hero__highlight-icon {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  flex-shrink: 0;
  border-radius: 0.55rem;
  font-size: 0.78rem;
}

.stitch-hero__highlight-icon.is-orange {
  background: rgba(234, 88, 12, 0.22);
  color: #fb923c;
}

.stitch-hero__highlight-icon.is-green {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.stitch-hero__highlight-icon.is-amber {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.stitch-hero__panel {
  width: min(100%, 20rem);
  padding: 1.15rem 1.2rem;
  border-radius: 1.15rem;
  background: rgba(11, 18, 32, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.stitch-hero__panel-lead {
  margin: 0 0 0.55rem;
  color: #fb923c;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.55;
}

.stitch-hero__panel-title {
  margin: 0 0 0.9rem;
  font-size: 0.92rem;
  font-weight: 800;
}

.stitch-hero__panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.stitch-hero__panel li {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.stitch-hero__panel-icon {
  display: grid;
  place-items: center;
  width: 2.05rem;
  height: 2.05rem;
  flex-shrink: 0;
  border-radius: 0.7rem;
  background: rgba(37, 99, 235, 0.18);
  color: #93c5fd;
  font-size: 0.85rem;
}

.stitch-hero__panel strong {
  display: block;
  font-size: 0.82rem;
}

.stitch-hero__panel em {
  display: block;
  margin-top: 0.12rem;
  font-style: normal;
  font-size: 0.7rem;
  color: rgba(248, 250, 252, 0.65);
}

.stitch-hero :deep(.swiper-pagination) {
  bottom: 1.15rem;
  inset-inline-start: auto;
  inset-inline-end: max(1rem, calc((100% - 1180px) / 2 + 1rem));
  width: auto;
  display: flex;
  gap: 0.35rem;
}

.stitch-hero :deep(.swiper-pagination-bullet) {
  width: 0.55rem;
  height: 0.55rem;
  background: rgba(255, 255, 255, 0.45);
  opacity: 1;
}

.stitch-hero :deep(.swiper-pagination-bullet-active) {
  width: 1.35rem;
  border-radius: 999px;
  background: #ea580c;
}

@media (min-width: 640px) {
  .stitch-hero__slide,
  .stitch-hero__inner {
    min-height: clamp(26rem, 68vh, 38rem);
  }

  .stitch-hero__inner {
    padding-block: 5.5rem 4.5rem;
  }

  .stitch-hero__shade {
    background:
      linear-gradient(100deg, rgba(8, 14, 28, 0.88) 8%, rgba(8, 14, 28, 0.55) 48%, rgba(8, 14, 28, 0.28) 100%),
      linear-gradient(0deg, rgba(8, 14, 28, 0.82) 0%, transparent 42%);
  }

  .stitch-hero__text {
    display: block;
  }

  .stitch-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .stitch-hero__cta,
  .stitch-hero__ghost {
    min-height: 2.85rem;
    padding: 0.55rem 1.05rem;
    font-size: 0.84rem;
  }

  .stitch-hero__ghost-sm {
    display: none;
  }

  .stitch-hero__ghost-lg {
    display: inline;
  }

  .stitch-hero__highlights {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 0.95rem;
    max-width: 36rem;
  }
}

@media (min-width: 900px) {
  .stitch-hero__inner {
    grid-template-columns: 1.35fr 0.75fr;
    align-items: center;
    padding-block: 6rem 5.5rem;
  }

  .stitch-hero__panel {
    display: block;
    justify-self: start;
  }
}
</style>
