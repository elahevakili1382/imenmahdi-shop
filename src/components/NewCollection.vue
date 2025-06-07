<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
    <div
      v-for="(product, index) in products"
      :key="index"
      class="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      <div class="overflow-hidden">
        <img
          :src="product.image"
          alt=""
          class="w-full h-48 object-cover rounded-t-xl transform group-hover:scale-105 transition duration-300"
        />
      </div>
      <div class="p-4 text-center">
        <h3 class="text-base font-bold mb-1">{{ product.title }}</h3>
        <p class="text-orange-600">{{ product.price }} تومان</p>
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
