<script setup>
import Navbar from './components/Navbar.vue'
import { RouterView } from 'vue-router'

// import HeroSlider from './components/HeroSlider.vue'

import 'swiper/css'

// import Footer from './components/Footer.vue'
</script>

<template>
  <Navbar />
  <!-- <HeroSlider /> -->

  <RouterView />
  <!-- <Footer /> -->
</template>

<style scoped>
/* استایل دلخواه */
</style>
