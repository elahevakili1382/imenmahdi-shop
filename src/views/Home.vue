<template>
  <main>
    <HeroSlider />
    <featureBanner />
    <NewCollection />
    <Newletter />
    <popularProduct />
  </main>
</template>
<script setup>
import HeroSlider from '../components/HeroSlider.vue'
import FeatureBanner from '../components/FeatureBanner.vue'
import NewCollection from '../components/NewCollection.vue'
import Newletter from '@/components/Newletter.vue'
import popularProduct from '@/components/popularProduct.vue'
</script>
