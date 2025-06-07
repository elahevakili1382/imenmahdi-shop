<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
    <div
      v-for="(product, index) in products"
      :key="index"
      class="p-4 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl text-center"
    >
      <img :src="product.image" alt="" class="w-full h-40 object-cover rounded-xl mb-3" />
      <h3 class="text-base font-bold text-gray-700">{{ product.title }}</h3>
      <p class="text-orange-600 mt-2 font-semibold">{{ product.price }} تومان</p>
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
