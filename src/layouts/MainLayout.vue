<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1 container mx-auto px-4 py-6"></main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>
