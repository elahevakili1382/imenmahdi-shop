<template>
  <main>
    <HeroSlider />
    <featureBanner />
    <NewCollection />
    <Newletter />
    <popularProduct />
    <userRiviews />
  </main>
</template>
<script setup>
import HeroSlider from '../components/HeroSlider.vue'
import FeatureBanner from '../components/FeatureBanner.vue'
import NewCollection from '../components/NewCollection.vue'
import Newletter from '@/components/Newletter.vue'
import popularProduct from '@/components/popularProduct.vue'
import userRiviews from '@/components/userRiviews.vue'
</script>
