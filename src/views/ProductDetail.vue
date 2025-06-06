<template>
  <div>
    <h2>Product Detail Page</h2>
    <!-- جزئیات محصول از روی route param نمایش داده میشه -->
  </div>
</template>

<script setup>
// در اینجا مثلاً id محصول از route گرفته میشه
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = route.params.id

// تو پروژه واقعیت بعداً می‌تونی با این id اطلاعات رو fetch کنی
</script>

<style scoped>
h2 {
  font-size: 20px;
  margin-bottom: 16px;
}
</style>
