<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">هیرو صفحه اصلی</h1>
        <p class="text-sm text-slate-400 mt-1">
          بعد از بالا آمدن سایت هم می‌توانید متن و عکس اسلایدها را از اینجا عوض کنید. تغییرات روی همین مرورگر ذخیره می‌شود.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost border-white/15 min-h-10 text-sm" @click="content.resetHero()">بازگشت پیش‌فرض</button>
        <button class="btn btn-primary min-h-10 text-sm" @click="add">اسلاید جدید</button>
      </div>
    </div>

    <div class="space-y-5">
      <article
        v-for="(slide, index) in content.heroSlides"
        :key="index"
        class="dash-card grid md:grid-cols-[180px_1fr] gap-4"
      >
        <img :src="asset(slide.image)" alt="" class="h-36 w-full rounded-2xl object-cover" />
        <div class="space-y-2">
          <input :value="slide.kicker" class="admin-field" @input="patch(index, { kicker: $event.target.value })" />
          <input :value="slide.headline" class="admin-field" @input="patch(index, { headline: $event.target.value })" />
          <textarea :value="slide.copy" class="admin-field min-h-20" @input="patch(index, { copy: $event.target.value })" />
          <div class="grid sm:grid-cols-2 gap-2">
            <input :value="slide.cta" class="admin-field" @input="patch(index, { cta: $event.target.value })" />
            <input :value="slide.to" class="admin-field" @input="patch(index, { to: $event.target.value })" />
          </div>
          <select :value="presetValue(slide.image)" class="admin-field" @change="onPreset(index, $event.target.value)">
            <option value="custom">عکس سفارشی / آپلود</option>
            <option v-for="option in heroImageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <input type="file" accept="image/*" class="text-sm" @change="onFile(index, $event)" />
          <button
            class="btn btn-ghost border-red-400/40 text-red-300 min-h-10 text-sm"
            type="button"
            @click="content.removeSlide(index)"
          >
            حذف اسلاید
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useContentStore } from '@/stores/contentStore'
import { heroImageOptions } from '@/data/hero'
import { asset } from '@/utils/asset'

const content = useContentStore()

function patch(index, payload) {
  content.updateSlide(index, payload)
}

function presetValue(image) {
  return heroImageOptions.some((item) => item.value === image) ? image : 'custom'
}

function onPreset(index, value) {
  if (value === 'custom') return
  patch(index, { image: value })
}

function onFile(index, event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => patch(index, { image: String(reader.result) })
  reader.readAsDataURL(file)
}

function add() {
  content.addSlide({
    kicker: 'اسلاید جدید',
    headline: 'عنوان هیرو',
    copy: 'توضیح کوتاه اسلاید.',
    cta: 'مشاهده کاتالوگ',
    to: '/products',
  })
}
</script>

<style scoped>
.admin-field {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
  padding: 10px 12px;
  color: inherit;
}
</style>
