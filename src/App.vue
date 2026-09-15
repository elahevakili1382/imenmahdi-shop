<script setup>
import { RouterView, useRoute } from 'vue-router'
import ContactPopup from '@/components/ContactPopup.vue'

const route = useRoute()
</script>

<template>
  <RouterView />
  <ContactPopup
    v-if="route.name !== 'Invoice' && route.name !== 'CartInvoice' && !route.path.startsWith('/dashboard')"
  />
</template>
