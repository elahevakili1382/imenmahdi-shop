<script setup>
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
const openSubMenu = ref(null)

function toggleSubMenu(name) {
  openSubMenu.value = openSubMenu.value === name ? null : name
}

function closeMenu() {
  isMobileMenuOpen.value = false
  openSubMenu.value = null
}
</script>

<template>
  <header class="bg-white shadow sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- لوگو -->
        <div class="text-2xl font-bold text-orange-500">ایمنی</div>

        <!-- منوی دسکتاپ -->
        <ul class="hidden md:flex gap-8 items-center text-sm font-semibold text-gray-700">
          <!-- لینک ساده -->
          <li>
            <router-link to="/" class="hover:text-orange-500 transition">صفحه اصلی</router-link>
          </li>

          <!-- زیرمنو -->
          <li class="relative group">
            <router-link to="#" class="hover:text-orange-500 transition">تجهیزات ایمنی</router-link>

            <!-- زیرمنو فقط با هاور -->
            <ul
              class="absolute right-0 mt-2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md w-48 text-sm border border-gray-100 z-50"
            >
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >ماسک ایمنی</router-link
                >
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >کفش و پوتین اداری</router-link
                >
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >چکمه لاستیکی</router-link
                >
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >دستکش ایمنی</router-link
                >
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >گوشی صداگیر</router-link
                >
              </li>
            </ul>
          </li>

          <!-- زیرمنو -->
          <li class="relative group">
            <router-link to="#" class="hover:text-orange-500 transition"
              >تجهیزات آتش نشانی
            </router-link>

            <!-- زیرمنو فقط با هاور -->
            <ul
              class="absolute right-0 mt-2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md w-48 text-sm border border-gray-100 z-50"
            >
              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  لباس آتش نشانی
                </router-link>
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >شیلنگ آتش نشانی
                </router-link>
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >چکمه عملیاتی
                </router-link>
              </li>
              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  سیستم اعلان حریق
                </router-link>
              </li>
            </ul>
          </li>

          <!-- زیرمنو -->
          <li class="relative group">
            <router-link to="#" class="hover:text-orange-500 transition"
              >تجهیزات ترافیکی
            </router-link>

            <!-- زیرمنو فقط با هاور -->
            <ul
              class="absolute right-0 mt-2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md w-48 text-sm border border-gray-100 z-50"
            >
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >سرعت گیر
                </router-link>
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >چشم گربه ای
                </router-link>
              </li>
            </ul>
          </li>

          <!-- زیرمنو -->
          <li class="relative group">
            <router-link to="#" class="hover:text-orange-500 transition"
              >تجهیزات کار در ارتفاع
            </router-link>

            <!-- زیرمنو فقط با هاور -->
            <ul
              class="absolute right-0 mt-2 hidden group-hover:flex flex-col bg-white shadow-md rounded-md w-48 text-sm border border-gray-100 z-50"
            >
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >کمربند ایمنی</router-link
                >
              </li>
              <li>
                <router-link to="#" class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                  >جعبه ی کمک های اولیه
                </router-link>
              </li>
              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  تشک نجات</router-link
                >
              </li>
              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  کلاه کار در ارتفاع
                </router-link>
              </li>
              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  چراغ قوه
                </router-link>
              </li>

              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  نردبان طنابی
                </router-link>
              </li>

              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  طناب ابریشمی
                </router-link>
              </li>

              <li>
                <router-link
                  to="#"
                  class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600"
                >
                  گازسنج
                </router-link>
              </li>
            </ul>
          </li>

          <!-- لینک ساده -->
          <li>
            <router-link to="/contact" class="hover:text-orange-500 transition"
              >تماس با ما</router-link
            >
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style scoped></style>
