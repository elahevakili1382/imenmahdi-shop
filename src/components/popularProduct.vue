<template>
  <section class="py-12 px-4">
    <!-- عنوان بخش -->
    <div
      class="grid grid-col-3 md:grid-col-3 relative text-center mb-8 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-z-10 before:w-full before:h-px before:bg-black/10 m-5"
    >
      <span
        class="text-3xl font-bold px-8 py-4 text-black bg-white border border-gray-300 inline-block mr-2"
      >
        محصولات پر فروش
      </span>
    </div>

    <!-- اسلایدر -->
    <swiper
      :slides-per-view="1"
      :space-between="20"
      :breakpoints="breakpoints"
      :modules="[Pagination]"
      :pagination="pagination"
      class="popular-swiper"
    >
      <swiper-slide v-for="(item, index) in products" :key="index">
        <div class="bg-white rounded-xl shadow p-4 text-center">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
          <p class="text-orange-600">{{ item.price }} تومان</p>
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'

// Swiper modules

// اسلایدر

const products = ref([])
const breakpoints = {
  640: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 4 },
}

const pagination = { clickable: true }

onMounted(async () => {
  try {
    const res = await axios.get(import.meta.env.BASE_URL + 'data/products.json')

    products.value = res.data
  } catch (error) {
    console.error('🛑 خطا در دریافت محصولات:', error)
  }
})
</script>

<style scoped>
.popular-swiper {
  width: 100%;
}
</style>
