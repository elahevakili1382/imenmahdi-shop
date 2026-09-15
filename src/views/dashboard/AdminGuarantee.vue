<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">ارسال سریع و تعهد فروشگاه</h1>
        <p class="text-sm text-slate-400 mt-1">
          متن، عکس و دکمه بخش «ارسال سریع» صفحه اصلی را از اینجا عوض کنید. ذخیره روی همین مرورگر است.
        </p>
      </div>
      <button class="btn btn-ghost min-h-10 text-sm" type="button" @click="content.resetGuarantee()">
        بازگشت پیش‌فرض
      </button>
    </div>

    <article class="dash-card grid md:grid-cols-[200px_1fr] gap-4 mb-4">
      <img :src="asset(content.guarantee.image)" alt="" class="h-40 w-full rounded-2xl object-cover" />
      <div class="space-y-2">
        <input
          :value="content.guarantee.kicker"
          class="admin-field"
          placeholder="برچسب کوچک"
          @input="patch({ kicker: $event.target.value })"
        />
        <input
          :value="content.guarantee.title"
          class="admin-field"
          placeholder="عنوان"
          @input="patch({ title: $event.target.value })"
        />
        <textarea
          :value="content.guarantee.lead"
          class="admin-field min-h-20"
          placeholder="متن معرفی"
          @input="patch({ lead: $event.target.value })"
        />
        <div class="grid sm:grid-cols-2 gap-2">
          <input
            :value="content.guarantee.cta"
            class="admin-field"
            placeholder="متن دکمه"
            @input="patch({ cta: $event.target.value })"
          />
          <input
            :value="content.guarantee.ctaTo"
            class="admin-field"
            placeholder="لینک دکمه مثل /contact"
            @input="patch({ ctaTo: $event.target.value })"
          />
        </div>
        <select :value="presetValue(content.guarantee.image)" class="admin-field" @change="onPreset($event.target.value)">
          <option value="custom">عکس سفارشی / آپلود</option>
          <option v-for="option in guaranteeImageOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <input type="file" accept="image/*" class="text-sm" @change="onFile" />
      </div>
    </article>

    <div class="space-y-3">
      <article v-for="(point, index) in content.guarantee.points" :key="point.n" class="dash-card grid sm:grid-cols-[80px_1fr_2fr] gap-3">
        <input
          :value="point.n"
          class="admin-field"
          @input="content.updateGuaranteePoint(index, { n: $event.target.value })"
        />
        <input
          :value="point.title"
          class="admin-field"
          placeholder="عنوان مورد"
          @input="content.updateGuaranteePoint(index, { title: $event.target.value })"
        />
        <input
          :value="point.text"
          class="admin-field"
          placeholder="توضیح"
          @input="content.updateGuaranteePoint(index, { text: $event.target.value })"
        />
      </article>
    </div>
  </section>
</template>

<script setup>
import { useContentStore } from '@/stores/contentStore'
import { guaranteeImageOptions } from '@/data/guarantee'
import { asset } from '@/utils/asset'

const content = useContentStore()

function patch(payload) {
  content.updateGuarantee(payload)
}

function presetValue(image) {
  return guaranteeImageOptions.some((item) => item.value === image) ? image : 'custom'
}

function onPreset(value) {
  if (value === 'custom') return
  patch({ image: value })
}

function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => patch({ image: String(reader.result) })
  reader.readAsDataURL(file)
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
