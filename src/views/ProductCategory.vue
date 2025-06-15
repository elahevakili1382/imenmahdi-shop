<template>
  <section class="py-10 px-4">
    <h1 class="text-2xl font-bold text-center mb-8">محصولات : {{ categoryName }}</h1>

    <div v-if="loading" class="text-center">در حال بارگذاری...</div>
    <div v-else-if="products.length === 0" class="text-center text-gray-500">محصولی یافت نشد</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded shadow p-4">
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-48 object-cover rounded mb-4"
        />
        <h3 class="text-lg font-semibold mb-2">{{ product.title }}</h3>
        <p class="text-orange-500 font-bold">{{ product.price }} تومان</p>
        <router-link
          :to="`/product/${product.slug}`"
          class="mt-3 inline-block text-blue-500 hover:underline"
          >مشاهده جزئیات
        </router-link>
      </div>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const categorySlug = route.params.categorySlug
const categoryName = ref(categorySlug.replace(/-/g, ''))

const products = ref([])
const loading = ref(true)
onMounted(async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/products/category/${categorySlug}`,
      (products.value = res.data),
    )
  } catch (err) {
    console.error('❌ خطا در دریافت محصولات:', err)
  } finally {
    loading.value = false
  }
})
</script>
