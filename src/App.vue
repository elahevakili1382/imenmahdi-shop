<script setup>
import Navbar from './components/Navbar.vue'
import HeroSlider from './components/HeroSlider.vue'

import 'swiper/css'

// import Footer from './components/Footer.vue'
</script>

<template>
  <Navbar />
  <HeroSlider />

  <router-view />
  <!-- <Footer /> -->
</template>

<style scoped>
/* استایل دلخواه */
</style>
