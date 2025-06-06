<template>
  <div>
    <h1>All Products</h1>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()

onMounted(async () => {
  productStore.loadMockProducts()
})
</script>
