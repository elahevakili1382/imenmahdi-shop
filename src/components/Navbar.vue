<script setup>
import { ref } from 'vue'

const openDropdown = ref(null)
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function toggleDropdown(name) {
  openDropdown.value = openDropdown.value === name ? null : name
}

// for menu
const navItems = [
  {
    name: 'main',
    label: 'صفحه اصلی ',
    to: '/',
  },
  {
    name: 'saftey',
    label: 'تجهیزات حفاظت فردی ',
    links: [
      { name: 'جعبه ی کمک های اولیه ', to: '#' },
      { name: 'پوتین و کفش اداری', to: '#' },
      { name: 'تجهیزات عایق برق', to: '#' },
      { name: 'چکمه لاستیکی ', to: '#' },
      { name: 'دستکش ایمنی ', to: '#' },
      { name: 'ماسک ایمنی ', to: '#' },
      { name: 'گوشی صداگیر ', to: '#' },
      { name: 'عینک ایمنی ', to: '#' },
      { name: 'کلاه ایمنی ', to: '#' },
      { name: 'لباس کار', to: '#' },
    ],
  },
  {
    name: 'breath',
    label: 'تجهیزات تنفسی ',
    to: '#',
  },
  {
    name: 'fire',
    label: 'تجهیزات آتش نشانی',
    links: [
      { name: 'لباس آتش نشانی', to: '#' },
      { name: 'شیلنگ آتش نشانی', to: '#' },
      { name: 'کپسول آتش نشانی', to: '#' },
      { name: 'سیستم اعلان حریق ', to: '#' },
      { name: 'دستکش آتش نشانی ', to: '#' },
      { name: 'چکمه عملیاتی ', to: '#' },
      { name: 'کلاه آتش نشانی ', to: '#' },
      { name: 'چراغ قوه ', to: '#' },
      { name: 'گازسنج ', to: '#' },
    ],
  },

  {
    name: 'trafic',
    label: 'تجهیزات ترافیکی ',
    links: [
      { name: 'آیینه ترافیکی', to: '#' },
      { name: 'سرعت گیر ', to: '#' },
      { name: 'تابلو و علائم', to: '#' },
      { name: 'مانع ترافیکی', to: '#' },
      { name: 'چراغ های ترافیکی', to: '#' },
    ],
  },
  {
    name: 'height',
    label: 'تجهیزات کار در ارتفاع  ',
    links: [
      { name: 'کلاه کار در ارتفاع ', to: '#' },
      { name: 'کمربند ایمنی ', to: '#' },
      { name: 'نردبان طنابی ', to: '#' },
      { name: 'طناب ابریشمی ', to: '#' },
    ],
  },
  {
    name: 'contact',
    label: 'تماس با ما ',
    to: '/contact',
  },
]
</script>

<template>
  <header class="bg-white sticky top-0 z-50 h-[40px] w-full mt-5">
    <div class="flex items-center justify-between h-full rtl mx-5">
      <div class="text-orange-500 text-2xl font-bold">سیفتی مارکت</div>
      <!-- search -->
      <div class="hidden md:flex w-full max-w-md relative items-center">
        <input
          type="text"
          placeholder="...جست وجو "
          class="w-full rounded-r-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <i
          class="fas fa-search px-3 absolute left-3 top-1/2 -translate-y-1/2 text-black-700 pointer-events-none"
        ></i>
      </div>
      <div class="flex items-center gap-4 text-gray-600 text-xl">
        <i class="fas fa-user hover:text-orange-500 transition" title="حساب کاربری "></i>
        <i class="fas fa-heart hover:text-orange-500 transition" title="حساب کاربری "></i>
        <i class="fas fa-shopping-cart hover:text-orange-500 transition" title="حساب کاربری "></i>

        <!--mobile menu  -->
        <!-- آیکن منوی موبایل -->
        <div class="flex flex-row-reverse md:hidden">
          <button
            @click="toggleMobileMenu"
            class="text-2xl text-orange-500 focus:outline-none z-50"
            aria-label="باز کردن منو"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop menu -->
    <!-- زیر منو ها  -->
    <!-- Desktop menu -->
    <nav class="hidden md:block w-full py-2 bg-orange-500 my-3 mx-0 px-3">
      <ul
        class="hidden md:flex justify-center w-full gap-8 items-center text-sm font-semibold text-white"
      >
        <li v-for="item in navItems" :key="item.name" class="relative group">
          <template v-if="item.links">
            <span class="cursor-pointer text-base text-white">{{ item.label }}</span>
            <ul
              class="absolute right-0 mt-2 my-0 hidden group-hover:flex flex-col bg-white text-base text-orange-700 shadow-md w-48 border border-orange-800 z-40"
            >
              <li v-for="link in item.links" :key="link.name">
                <router-link
                  :to="link.to"
                  class="block px-4 py-2 hover:bg-orange-600 hover:text-white"
                >
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </template>
          <template v-else>
            <router-link :to="item.to || '/'" class="cursor-pointer text-base text-white">
              {{ item.label }}
            </router-link>
          </template>
        </li>
      </ul>
    </nav>

    <!-- mobile Menu  -->
    <!-- منوی موبایل -->

    <div
      v-if="mobileMenuOpen"
      @click="toggleMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>
    <aside
      v-if="mobileMenuOpen"
      class="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 md:hidden"
    >
      <div class="flex justify-between items-center px-4 py-4 border-b">
        <span class="font-bold text-orange-600 text-lg">منو </span>
        <button @click="toggleMobileMenu" aria-label="بستن ">
          <i class="fas fa-tiems text-xl text-orange-600"></i>
        </button>
      </div>

      <ul class="flex flex-col gap-4 text-base font-semibold px-4 py-6 text-orange-800">
        <li v-for="item in navItems" :key="item.name">
          <template v-if="item.links">
            <details class="group">
              <summary class="cursor-pointer py-4">{{ item.label }}</summary>
              <ul class="pl-4 mt-2 flex flex-col gap-2 text-orange-600">
                <li v-for="link in item.links" :key="link.name">
                  <router-link
                    :to="link.to"
                    class="text-orange-600 hover:text-black transition-colors duration-200"
                    >{{ link.name }}</router-link
                  >
                </li>
              </ul>
            </details>
          </template>
          <template v-else>
            <router-link :to="item.to" class="block py-2">{{ item.label }}</router-link>
          </template>
        </li>
      </ul>
    </aside>
  </header>
</template>
<style scoped>
.rtl {
  direction: rtl;
}
</style>
