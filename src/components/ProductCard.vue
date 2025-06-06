<template>
  <div class="product-card">
    <img :src="product.image" alt="Product Image" class="product-image" />
    <h3>{{ product.name }}</h3>
    <p>{{ product.price }}تومان</p>
    <router-link :to="`/products/${product.id}`" class="btn btn-primary"
      >مشاهده جزئیات
    </router-link>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<style scope>
.product-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.product-image {
  max-width: 100%;
  height: auto;
}
</style>
