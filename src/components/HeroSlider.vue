<template>
  <div class="relative w-full h-[300px] sm:h-[500px] overflow-hidden mt-5">
    <swiper :slides-per-view="1" :loop="true" :autoplay:="{ delay: 5000 }" class="h-full">
      <swiper-slide v-for="(slide, index) in slides" :key="index" class="relative">
        <img
          :src="slide.image"
          class="w-full h-full object-cover"
          :style="`object-position: ${slide.position}`"
          alt="Slide Image"
        />
        <div
          class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4"
        >
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
            {{ slide.title }}
          </h1>
          <p></p>
          <button
            class="text-white bg-orange-500 hover:bg-orange-600 text-base sm:text-lg py-2 sm:py-3 px-4 sm:px-6 rounded-3xl transition"
          >
            {{ slide.button }}
          </button>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const slides = [
  {
    image: '/imenmahdi-shop/images/firefighter-suits-hanging-from-wall-station.png',
    title: 'لوازم ایمنی و آتش نشانی مهدی',
    button: 'مشاهده محصولات ',
    position: 'top 30%',
  },
]
</script>
