<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
import 'swiper/css'
</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
</template>

<style scoped>
/* استایل دلخواه */
</style>
