<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ShaderFitOptions,
  ShaderMount,
  getShaderColorFromString,
  meshGradientFragmentShader,
} from '@paper-design/shaders'

const props = defineProps({
  colors: {
    type: Array,
    default: () => ['#0C0E12', '#C45C26', '#A34B1F', '#C4A484', '#171B21'],
  },
  speed: { type: Number, default: 0.28 },
  opacity: { type: Number, default: 1 },
  distortion: { type: Number, default: 0.72 },
  swirl: { type: Number, default: 0.14 },
  grainMixer: { type: Number, default: 0.1 },
  grainOverlay: { type: Number, default: 0.14 },
})

const el = ref(null)
let mount

onMounted(() => {
  if (!el.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mount = new ShaderMount(
    el.value,
    meshGradientFragmentShader,
    {
      u_colors: props.colors.map((color) => getShaderColorFromString(color)),
      u_colorsCount: Math.min(props.colors.length, 10),
      u_distortion: props.distortion,
      u_swirl: props.swirl,
      u_grainMixer: props.grainMixer,
      u_grainOverlay: props.grainOverlay,
      u_fit: ShaderFitOptions.cover,
      u_scale: 1,
      u_rotation: 0,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    { alpha: true, antialias: false, powerPreference: 'low-power' },
    reduce ? 0 : props.speed,
    0,
    1,
  )
})

onBeforeUnmount(() => {
  mount?.dispose()
  mount = undefined
})
</script>

<template>
  <div ref="el" class="paper-mesh" :style="{ opacity }" aria-hidden="true" />
</template>

<style scoped>
.paper-mesh {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.paper-mesh :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
