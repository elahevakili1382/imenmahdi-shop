<template>
  <section
    class="newletter bg-fixed-desktop object-contain mt-16 py-10 px-4 sm:px-6 lg:px-16 text-center min-h-[350px] sm:min-h-[400px] md:min-h-[300px]"
  >
    <h2 class="text-2xl sm:text-3xl font-bold text-orange-700 mb-4">عضو خبرنامه شوید</h2>
    <p>اولین نفری باشید که از تخفیف ها و محصولات جدید با خبر می شود</p>
    <form
      @submit.prevent="submitForm"
      class="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto"
    >
      <input
        type="email"
        v-model="email"
        required
        placeholder="ایمیل شما "
        class="w-full sm:w-2/3 px-4 py-2 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />
      <button
        type="submit"
        class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
      >
        عضویت
      </button>
    </form>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const email = ref('')

const submitForm = () => {
  alert(`ایمیل شما به موفقیت ثبت شد :$(email.value)`)
  email.value = ''
}
</script>
<style scoped>
.newletter {
  background: url('/images/letter-bg.jpg') no-repeat center center fixed;
  background-size: cover;
  background-position: center;
}

.bg-fixed-desktop {
  background-attachment: fixed;
}

@media (max-width: 768px) {
  .bg-fixed-desktop {
    background-attachment: scroll;
  }
}
</style>
