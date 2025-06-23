<template>
  <section id="productdetail" class="section-p1" v-if="product">
    <div class="single-pro-image">
      <img :src="product.mainImage" width="100%" id="MainImg" alt="" />

      <div>
        <div>
          <img src="" alt="" />
        </div>
      </div>
    </div>
    <!--  -->
    <div>
      <h4></h4>
      <h2></h2>
      <h6></h6>
      <select name="" id="">
        <option value=""></option>
        <option value=""></option>
      </select>

      <input type="number" />
      <button></button>
      <h4></h4>
      <span>{{ product.description }}</span>
    </div>
  </section>
</template>
<script setup>
import { useRoute } from 'vue-router'
import axios from 'axios'
import { onMounted, ref } from 'vue'

const route = useRoute()
const slug = route.params.slug

const product = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${slug}`)
    product.value = res.data

    const mockData = {
      slug: 'mask-3m-6200',
      title: 'ماسک ایمنی 2 فیلتر نیم صورت 6200',
      price: '2.300.000',
      category: 'تجهیزات ایمنی',
      subcategory: 'ماسک ایمنی',
      mainImage: '/images/mask/6200-1.avif',
      gallery: [
        '/images/mask/6200-1.avif',
        '/images/mask/6200-3m-2.avif',
        '/images/mask/6200-3m-3.avif',
        '/images/mask/6200-3m-4.avif',
      ],
      sizes: ['کوچک', 'متوسط', 'بزرگ'],
      description: `صنایع پیشنهادی شامل ساخت و ساز، تولید عمومی، زیرساخت‌های سنگین، تعمیر و نگهداری صنعتی، معدن، نفت و گاز، حمل و نقل و غیره است...`,
    }
    product.value = mockData
  } catch (e) {
    console.error('❌ خطا در دریافت محصول:', e)
  } finally {
    loading.value = false
  }
})
</script>
