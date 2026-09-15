<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">مدیریت محصولات</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.products.length }} کالا در کاتالوگ</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost border-white/15 min-h-10 text-sm" @click="reset">کاتالوگ پیش‌فرض</button>
        <button class="btn btn-primary min-h-10 text-sm" @click="openCreate">افزودن محصول</button>
      </div>
    </div>

    <input
      v-model="query"
      class="w-full mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      placeholder="جستجوی نام یا دسته"
    />

    <div class="space-y-3">
      <article
        v-for="product in visible"
        :key="product.id"
        class="dash-card flex gap-4 items-center"
      >
        <img :src="asset(product.image)" alt="" class="w-16 h-16 rounded-xl object-contain bg-white/5" />
        <div class="flex-1 min-w-0">
          <p class="font-bold truncate">{{ product.title }}</p>
          <p class="text-sm text-slate-400">
            {{ product.category }} · موجودی {{ product.stock }} · {{ formatPrice(product.price) }} تومان
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button class="btn btn-ghost border-white/15 min-h-10 px-3 text-sm" @click="openEdit(product)">
            ویرایش
          </button>
          <button class="btn btn-ghost border-red-400/40 text-red-300 min-h-10 px-3 text-sm" @click="remove(product)">
            حذف
          </button>
        </div>
      </article>
    </div>

    <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" @click.self="editing = null">
      <form class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-graphite p-6 space-y-3" @submit.prevent="save">
        <h2 class="text-xl font-bold">{{ form.id ? 'ویرایش محصول' : 'محصول جدید' }}</h2>
        <input v-model="form.title" class="admin-field" placeholder="نام محصول" required />
        <input v-model.number="form.price" class="admin-field" type="number" min="0" placeholder="قیمت" required />
        <select v-model="form.category" class="admin-field">
          <option v-for="group in categoryTree" :key="group.slug" :value="group.name">{{ group.name }}</option>
        </select>
        <select v-model="form.subcategory" class="admin-field">
          <option v-for="child in subOptions" :key="child.slug" :value="child.name">{{ child.name }}</option>
        </select>
        <input v-model.number="form.stock" class="admin-field" type="number" min="0" placeholder="موجودی" />
        <input v-model="form.image" class="admin-field" placeholder="مسیر عکس مثل images/hamlet1.png" />
        <input type="file" accept="image/*" class="text-sm" @change="onFile" />
        <textarea v-model="form.description" class="admin-field min-h-24" placeholder="توضیح" />
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.featured" type="checkbox" /> منتخب
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.popular" type="checkbox" /> پرفروش
        </label>
        <div class="flex gap-2 pt-2">
          <button class="btn btn-primary flex-1" type="submit">ذخیره</button>
          <button class="btn btn-ghost border-white/15 flex-1" type="button" @click="editing = null">انصراف</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { categoryTree } from '@/data/catalog'
import { asset } from '@/utils/asset'
import { formatPrice } from '@/utils/money'
import { useToast } from 'vue-toastification'

const store = useProductStore()
const toast = useToast()
const query = ref('')
const editing = ref(null)
const form = reactive(emptyForm())

const visible = computed(() => {
  const q = query.value.trim()
  if (!q) return store.products
  return store.search(q)
})

const subOptions = computed(() => {
  const group = categoryTree.find((item) => item.name === form.category)
  return group?.children || []
})

watch(
  () => form.category,
  () => {
    if (!subOptions.value.some((item) => item.name === form.subcategory)) {
      form.subcategory = subOptions.value[0]?.name || ''
    }
  },
)

function emptyForm() {
  return {
    id: '',
    title: '',
    price: 0,
    category: categoryTree[0].name,
    subcategory: categoryTree[0].children[0].name,
    stock: 10,
    image: 'images/hamlet1.png',
    description: '',
    featured: false,
    popular: false,
  }
}

function openCreate() {
  Object.assign(form, emptyForm())
  editing.value = true
}

function openEdit(product) {
  Object.assign(form, {
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    subcategory: product.subcategory,
    stock: product.stock,
    image: product.image,
    description: product.description,
    featured: Boolean(product.featured),
    popular: Boolean(product.popular),
  })
  editing.value = true
}

function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.image = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function save() {
  store.upsert({ ...form, sizes: form.id ? store.byId(form.id)?.sizes : ['یک سایز'] })
  toast.success('محصول ذخیره شد')
  editing.value = null
}

function remove(product) {
  if (!window.confirm(`حذف «${product.title}»؟`)) return
  store.remove(product.id)
  toast.success('حذف شد')
}

function reset() {
  if (!window.confirm('کاتالوگ به حالت اولیه برگردد؟')) return
  store.resetCatalog()
  toast.success('کاتالوگ بازنشانی شد')
}
</script>

<style scoped>
.admin-field {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
  padding: 12px 14px;
  color: inherit;
}
</style>
