<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import { brands } from '@/data/brands'
import { asset } from '@/utils/asset'
import 'swiper/css'
import 'swiper/css/pagination'

const modules = [Autoplay, Pagination]
const reduceMotion = ref(false)
const swiperRef = ref(null)
const track = ref(null)
let observer

const autoplay = computed(() =>
  reduceMotion.value
    ? false
    : {
        delay: 2600,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
)

function onSwiper(swiper) {
  swiperRef.value = swiper
}

function prevBrand() {
  swiperRef.value?.slidePrev()
}

function nextBrand() {
  swiperRef.value?.slideNext()
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!track.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      const swiper = swiperRef.value
      if (!swiper?.autoplay || reduceMotion.value) return
      if (entry.isIntersecting) swiper.autoplay.start()
      else swiper.autoplay.stop()
    },
    { threshold: 0.25 },
  )
  observer.observe(track.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="brand-gallery py-8 sm:py-12">
    <div class="container-shop mb-6 sm:mb-8">
      <p class="kicker mb-2">برندها</p>
      <h2 class="section-title">تأمین‌کنندگان کاتالوگ</h2>
    </div>

    <div ref="track" class="container-shop brand-track">
      <button class="brand-arrow brand-arrow-prev" type="button" aria-label="برند قبلی" @click="prevBrand">
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
      <div class="brand-viewport">
        <Swiper
          :modules="modules"
          :slides-per-view="'auto'"
          :space-between="18"
          :grab-cursor="true"
          :loop="true"
          :autoplay="autoplay"
          :pagination="{ clickable: true }"
          :speed="reduceMotion ? 0 : 520"
          @swiper="onSwiper"
        >
          <SwiperSlide v-for="brand in brands" :key="brand.name">
            <figure class="brand-card">
              <img :src="asset(brand.logo)" :alt="brand.name" />
            </figure>
          </SwiperSlide>
        </Swiper>
      </div>
      <button class="brand-arrow brand-arrow-next" type="button" aria-label="برند بعدی" @click="nextBrand">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.brand-gallery {
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}

.brand-track {
  position: relative;
  overflow: visible;
  width: 100%;
  min-width: 0;
}

.brand-viewport {
  overflow: hidden;
  width: 100%;
  min-width: 0;
}

.brand-viewport :deep(.swiper) {
  overflow: hidden;
  padding: 0 0 2.75rem;
}

.brand-viewport :deep(.swiper-slide) {
  width: min(240px, 78vw);
  height: auto;
}

.brand-viewport :deep(.swiper-pagination) {
  bottom: 0;
}

.brand-viewport :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: var(--color-sand);
  opacity: 1;
}

.brand-viewport :deep(.swiper-pagination-bullet-active) {
  width: 18px;
  border-radius: 999px;
  background: var(--color-ember);
}

.brand-arrow {
  position: absolute;
  top: 6.75rem;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  transform: translateY(-50%);
  border: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(12, 14, 18, 0.12);
  color: var(--color-ink);
  cursor: pointer;
}

.brand-arrow-prev {
  right: 10px;
}

.brand-arrow-next {
  left: 10px;
}

.brand-card {
  display: grid;
  place-items: center;
  overflow: hidden;
  height: 13.5rem;
  margin: 0;
  padding: 1.6rem 1.35rem;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(12, 14, 18, 0.06);
}

.brand-card img {
  width: 100%;
  max-width: 196px;
  max-height: 5.5rem;
  object-fit: contain;
  transition: transform 360ms ease;
}

.brand-card:hover img {
  transform: scale(1.04);
}

@media (min-width: 640px) {
  .brand-viewport :deep(.swiper-slide) {
    width: 280px;
  }

  .brand-arrow {
    top: 7.5rem;
  }

  .brand-card {
    height: 15rem;
  }

  .brand-card img {
    max-width: 216px;
    max-height: 6rem;
  }
}

@media (min-width: 1024px) {
  .brand-viewport :deep(.swiper-slide) {
    width: 320px;
  }

  .brand-arrow {
    top: 8.25rem;
  }

  .brand-card {
    height: 16.5rem;
    padding: 1.9rem;
  }

  .brand-card img {
    max-width: 236px;
    max-height: 6.75rem;
  }
}

@media (max-width: 639px) {
  .brand-arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-card img,
  .brand-card:hover img {
    transition: none;
    transform: none;
  }
}
</style>
