<template>
  <section class="py-12 px-4">
    <!-- عنوان -->
    <div
      class="relative text-center mb-8 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-z-10 before:w-full before:h-px before:bg-black/10 m-5"
    >
      <span
        class="text-3xl font-bold px-8 py-4 text-black bg-white border border-gray-300 inline-block mr-2"
      >
        محصولات پر فروش
      </span>
    </div>

    <!-- ردیف اول -->
    <swiper
      :slides-per-view="3"
      :space-between="24"
      :loop="true"
      :pagination="{ clickable: true }"
      :modules="[Pagination]"
      :breakpoints="breakpoints"
      class="mb-8"
    >
      <swiper-slide v-for="(item, index) in firstRow" :key="'row1-' + index">
        <div class="bg-white shadow border p-4 text-center">
          <div class="aspect-square mb-4 overflow-hidden rounded-lg max-h-64 mx-auto">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
          </div>

          <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
          <p class="text-orange-600">{{ item.price }} تومان</p>
          <div class="text-yellow-400 mt-2">
            <i class="fas fa-star" v-for="i in 4" :key="i" />
            <i class="fas fa-star-half-alt" />
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- ردیف دوم -->
    <swiper
      :slides-per-view="3"
      :space-between="24"
      :loop="true"
      :pagination="{ clickable: true }"
      :modules="[Pagination]"
      :breakpoints="breakpoints"
    >
      <swiper-slide v-for="(item, index) in secondRow" :key="'row2-' + index">
        <div class="bg-white shadow border p-4 text-center">
          <div class="aspect-square mb-4 overflow-hidden rounded-lg max-h-64 mx-auto">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
          </div>

          <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
          <p class="text-orange-600">{{ item.price }} تومان</p>
          <div class="text-yellow-400 mt-2">
            <i class="fas fa-star" v-for="i in 4" :key="i" />
            <i class="fas fa-star-half-alt" />
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'

const breakpoints = {
  0: { slidesPerView: 1 },
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
}

const products = ref([])

// نصف کردن محصولات برای دو ردیف
const firstRow = ref([])
const secondRow = ref([])

onMounted(async () => {
  try {
    const res = await axios.get(import.meta.env.BASE_URL + 'data/products.json')
    products.value = res.data
    const half = Math.ceil(products.value.length / 2)
    firstRow.value = products.value.slice(0, half)
    secondRow.value = products.value.slice(half)
  } catch (error) {
    console.error('🛑 خطا در دریافت محصولات:', error)
  }
})
</script>
<style scoped>
.swiper {
  width: 100%;
}
</style>
