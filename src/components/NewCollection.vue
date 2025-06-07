<template>
  <div class="grid grid-col-2 md:grid-col-4 gap-4 mt-8">
    <div
      v-for="(product, index) in products"
      :key="index"
      class="p-4 shadow rounded-xl text-center"
    >
      <img :src="product.image" alt="" class="w-full h-40 object-cover mb-2" />
      <h3 class="text-base font-bold">{{ product.title }}</h3>
      <p class="text-orange-600 mt-1">{{ product.price }}تومان</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])
onMounted(async () => {
  try {
    const res = await axios.get('/public/products.json')
    products.value = res.data
  } catch (err) {
    console.log('خطا در دریافت محصولات :', err)
  }
})
</script>
