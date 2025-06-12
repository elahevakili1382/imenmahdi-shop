<template>
  <section class="py-12 px-4" id="reviews">
    <!-- عنوان -->
    <div
      class="relative text-center mb-8 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-z-10 before:w-full before:h-px before:bg-black/10"
    >
      <span
        class="text-3xl font-bold px-8 py-4 text-black bg-white border border-gray-300 inline-block"
      >
        نظرات کاربران
      </span>
    </div>

    <!-- اسلایدر -->
    <swiper
      :slides-per-view="1"
      :space-between="20"
      :loop="true"
      :pagination="{ clickable: true }"
      :modules="[Pagination]"
      :breakpoints="breakpoints"
    >
      <swiper-slide
        v-for="(review, index) in reviews"
        :key="index"
        class="bg-white rounded-xl shadow border p-6 text-center max-w-xl mx-auto"
      >
        <img
          :src="review.image"
          :alt="review.name"
          class="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-orange-200"
        />
        <h3 class="text-lg font-bold mb-2">{{ review.name }}</h3>
        <p class="text-gray-600 mb-4 text-sm leading-relaxed">{{ review.text }}</p>

        <div class="text-yellow-400">
          <i class="fas fa-star" v-for="i in 4" :key="i" />
          <i class="fas fa-star-half-alt" />
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const breakpoints = {
  640: { slidesPerView: 1 },
  768: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
}

const reviews = [
  {
    name: 'جان دو',
    image: 'images/client1.jpg',
    text: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.',
  },
  {
    name: 'سارا رضایی',
    image: 'images/client2.jpg',
    text: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و گرافیک. با ابزارهای گرافیکی کاربردی.',
  },
  {
    name: 'علیرضا امیدی',
    image: 'images/client3.jpg',
    text: 'از نرم‌افزارهای طراحی گرافیک استفاده می‌شود. کاربردهای زیادی دارد برای صفحات وب و اپلیکیشن‌ها.',
  },
  {
    name: 'مریم احمدی',
    image: 'images/client4.jpg',
    text: 'لورم ایپسوم به عنوان متن پیش‌فرض در طراحی مورد استفاده قرار می‌گیرد و خوانایی خوبی دارد.',
  },
  {
    name: 'امیر غلامی',
    image: 'images/client5.jpg',
    text: 'این متن نمایشی است و هدف آن صرفاً پر کردن فضا جهت بررسی طراحی می‌باشد.',
  },
]
</script>
