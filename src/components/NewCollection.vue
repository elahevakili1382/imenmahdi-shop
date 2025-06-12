<template>
  <div
    class="relative text-center mb-8 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-z-10 before:w-full before:h-px before:bg-black/10 m-5"
  >
    <span
      class="text-3xl font-bold px-8 py-4 text-black bg-white border border-gray-300 inline-block mr-2"
    >
      محصولات بروز
    </span>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-16">
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      <div
        v-for="(product, index) in products"
        :key="index"
        class="bg-white w-full max-w-[300px] sm:max-w-full min-h-[420px] flex flex-col justify-between mx-auto rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-orange-600"
      >
        <!-- تصویر -->
        <div class="overflow-hidden rounded-t-xl">
          <img
            :src="product.image"
            alt=""
            class="w-full h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px] object-contain rounded-t-xl transform group-hover:scale-105 transition duration-300"
          />
        </div>

        <!-- محتوا پایین کارت -->
        <div class="flex justify-between items-end px-4 py-3 mt-auto">
          <div class="text-right">
            <h3 class="text-sm sm:text-base font-semibold mb-1">{{ product.title }}</h3>
            <p class="text-orange-600 text-sm">{{ product.price }} تومان</p>
          </div>
          <i
            class="pi pi-shopping-cart text-orange-600 text-2xl hover:text-orange-700 cursor-pointer"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])

onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.BASE_URL}data/products.json`)
    products.value = res.data
  } catch (err) {
    console.log('خطا در دریافت محصولات :', err)
  }
})
</script>
