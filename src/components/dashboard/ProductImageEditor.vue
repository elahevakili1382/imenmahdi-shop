<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  src: { type: String, default: '' },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'apply'])

const imageEl = ref(null)
const ready = ref(false)
let cropper = null

function destroyCropper() {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  ready.value = false
}

async function initCropper() {
  destroyCropper()
  await nextTick()
  if (!imageEl.value || !props.src) return
  cropper = new Cropper(imageEl.value, {
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    responsive: true,
    background: false,
    checkOrientation: true,
    ready() {
      ready.value = true
    },
  })
}

watch(
  () => [props.open, props.src],
  async ([isOpen]) => {
    if (isOpen && props.src) await initCropper()
    else destroyCropper()
  },
)

onBeforeUnmount(destroyCropper)

function zoomIn() {
  cropper?.zoom(0.1)
}

function zoomOut() {
  cropper?.zoom(-0.1)
}

function rotateLeft() {
  cropper?.rotate(-90)
}

function rotateRight() {
  cropper?.rotate(90)
}

function reset() {
  cropper?.reset()
}

function setAspect(ratio) {
  cropper?.setAspectRatio(ratio)
}

function apply() {
  if (!cropper) return
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 1280,
    maxHeight: 1280,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
  emit('apply', dataUrl)
  emit('close')
}

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="image-editor" @click.self="close">
    <div class="image-editor__panel" role="dialog" aria-modal="true" aria-label="ویرایش عکس محصول">
      <header class="image-editor__head">
        <h3>ویرایش عکس</h3>
        <button class="image-editor__icon-btn" type="button" aria-label="بستن" @click="close">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      <div class="image-editor__stage">
        <img ref="imageEl" :src="src" alt="ویرایش عکس" />
      </div>

      <div class="image-editor__tools">
        <div class="image-editor__group">
          <button type="button" :disabled="!ready" @click="zoomOut" title="کوچک‌نمایی">
            <i class="fa-solid fa-magnifying-glass-minus" aria-hidden="true"></i>
          </button>
          <button type="button" :disabled="!ready" @click="zoomIn" title="بزرگ‌نمایی">
            <i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>
          </button>
          <button type="button" :disabled="!ready" @click="rotateLeft" title="چرخش چپ">
            <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
          </button>
          <button type="button" :disabled="!ready" @click="rotateRight" title="چرخش راست">
            <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
          </button>
          <button type="button" :disabled="!ready" @click="reset" title="بازنشانی">
            <i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
          </button>
        </div>
        <div class="image-editor__group">
          <button type="button" :disabled="!ready" @click="setAspect(NaN)">آزاد</button>
          <button type="button" :disabled="!ready" @click="setAspect(1)">۱:۱</button>
          <button type="button" :disabled="!ready" @click="setAspect(4 / 3)">۴:۳</button>
          <button type="button" :disabled="!ready" @click="setAspect(3 / 4)">۳:۴</button>
        </div>
      </div>

      <footer class="image-editor__foot">
        <button class="image-editor__cancel" type="button" @click="close">انصراف</button>
        <button class="image-editor__apply" type="button" :disabled="!ready" @click="apply">
          اعمال برش
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.image-editor {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.72);
}

.image-editor__panel {
  display: grid;
  grid-template-rows: auto minmax(16rem, 1fr) auto auto;
  width: min(100%, 42rem);
  max-height: min(92vh, 44rem);
  overflow: hidden;
  border-radius: 1.25rem;
  background: #111827;
  color: #f8fafc;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.image-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.image-editor__head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.image-editor__icon-btn {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  cursor: pointer;
}

.image-editor__stage {
  min-height: 16rem;
  max-height: 55vh;
  background: #0b1220;
}

.image-editor__stage :deep(.cropper-container) {
  max-height: 55vh;
}

.image-editor__stage img {
  display: block;
  max-width: 100%;
}

.image-editor__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.image-editor__group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.image-editor__group button {
  min-height: 2.35rem;
  padding: 0 0.75rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.image-editor__group button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.image-editor__foot {
  display: flex;
  gap: 0.55rem;
  padding: 0.85rem 1rem 1rem;
}

.image-editor__cancel,
.image-editor__apply {
  flex: 1;
  min-height: 2.7rem;
  border-radius: 0.85rem;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
}

.image-editor__cancel {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: inherit;
}

.image-editor__apply {
  border: 0;
  background: #ea580c;
  color: #fff;
}

.image-editor__apply:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
