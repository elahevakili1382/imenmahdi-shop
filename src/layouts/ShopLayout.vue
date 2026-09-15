<template>
  <div class="shop-shell min-h-screen flex flex-col bg-stone text-ink">
    <a href="#main-content" class="skip-link">رفتن به محتوا</a>
    <Navbar />
    <main id="main-content" class="flex-1" tabindex="-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.shop-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.skip-link {
  position: absolute;
  inset-inline-start: 1rem;
  top: -3rem;
  z-index: 80;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: #0c0e12;
  color: #f4efe7;
}

.skip-link:focus {
  top: 0.75rem;
}
</style>
