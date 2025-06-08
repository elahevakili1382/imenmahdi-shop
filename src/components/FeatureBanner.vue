<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl mt-10 max-w-6xl mx-auto mb-4"
  >
    <div
      v-for="(feature, index) in features"
      :key="index"
      class="flex flex-col items-center text-center space-y-2 px-2 sm:px-4"
    >
      <i :class="feature.icon" class="text-orange-500 text-4xl sm:text-3xl md:text-4xl"></i>
      <div>
        <h3 class="text-base sm:text-lg md:text-xl font-semibold">{{ feature.title }}</h3>
        <p class="text-xs sm:text-sm text-gray-600">{{ feature.subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  {
    icon: 'pi pi-truck',
    title: 'ارسال رایگان ',
    subtitle: 'برای سفارشات بالای 500 هزار تومان ',
  },
  {
    icon: 'pi pi-lock',
    title: 'پرداخت امن ',
    subtitle: 'با درگاه های معتبر بانکی ',
  },
  {
    icon: 'pi pi-headphones',
    title: 'پشتیبانی 24 ساعته ',
    subtitle: 'در هفت روز هفته ',
  },
  {
    icon: 'pi pi-tag',
    title: ' تضمین قیمت  ',
    subtitle: 'بهترین قیمت بازار ',
  },
]
</script>
