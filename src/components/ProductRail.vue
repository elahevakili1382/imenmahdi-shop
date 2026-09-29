<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import ProductCard from '@/components/ProductCard.vue'
import 'swiper/css'
import 'swiper/css/navigation'

defineProps({
  products: { type: Array, required: true },
})

const modules = [Navigation]
const breakpoints = {
  0: { slidesPerView: 2.05, spaceBetween: 8 },
  640: { slidesPerView: 2.6, spaceBetween: 12 },
  1024: { slidesPerView: 3.6, spaceBetween: 14 },
  1280: { slidesPerView: 4.2, spaceBetween: 16 },
}
</script>

<template>
  <div v-if="products.length" class="product-rail relative">
    <Swiper
      :modules="modules"
      :breakpoints="breakpoints"
      :navigation="true"
      :grab-cursor="true"
      dir="rtl"
    >
      <SwiperSlide v-for="product in products" :key="product.id">
        <ProductCard :product="product" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.product-rail {
  overflow-x: hidden;
  overscroll-behavior-x: contain;
  min-width: 0;
}

.product-rail :deep(.swiper-slide) {
  height: auto;
}

.product-rail :deep(.swiper-slide > article) {
  height: 100%;
}

.product-rail :deep(.swiper-button-next),
.product-rail :deep(.swiper-button-prev) {
  color: #c45c26;
  width: 36px;
  height: 36px;
}

.product-rail :deep(.swiper-button-next::after),
.product-rail :deep(.swiper-button-prev::after) {
  font-size: 16px;
}

@media (max-width: 639px) {
  .product-rail :deep(.swiper-button-next),
  .product-rail :deep(.swiper-button-prev) {
    display: none;
  }
}
</style>
