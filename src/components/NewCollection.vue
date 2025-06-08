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

  <!--  -->
  <div class="container mx-auto px-4 sm:px-6 lg:px-16">
    <!--  -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      <div
        v-for="(product, index) in products"
        :key="index"
        class="bg-white min-h-[400px] rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-orange-600"
      >
        <div class="overflow-hidden">
          <img
            :src="product.image"
            alt=""
            class="w-full h-70 sm:h-64 md:h-72 lg:h-80 p-2 sm:p-3 md:p-4 object-cover rounded-t-xl transform group-hover:scale-105 transition duration-300"
          />
        </div>
        <div class="p-4 text-center">
          <h3 class="text-base font-bold mb-1">{{ product.title }}</h3>
          <p class="text-orange-600">{{ product.price }} تومان</p>
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
