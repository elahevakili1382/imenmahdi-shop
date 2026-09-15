<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import vertSrc from '@/shaders/hero.vert'
import fragSrc from '@/shaders/hero.frag'

const props = defineProps({
  intensity: { type: Number, default: 1 },
})

const canvas = ref(null)
let gl
let program
let buffer
let raf
let observer
let visible = true
let reduce = false
let start = 0
const uniforms = {}

function compile(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function setup() {
  gl = canvas.value?.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  })
  if (!gl) return false

  const vert = compile(gl.VERTEX_SHADER, vertSrc)
  const frag = compile(gl.FRAGMENT_SHADER, fragSrc)
  if (!vert || !frag) return false

  program = gl.createProgram()
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false

  buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const loc = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  uniforms.time = gl.getUniformLocation(program, 'uTime')
  uniforms.resolution = gl.getUniformLocation(program, 'uResolution')
  uniforms.intensity = gl.getUniformLocation(program, 'uIntensity')
  uniforms.reduce = gl.getUniformLocation(program, 'uReduce')
  return true
}

function resize() {
  if (!canvas.value || !gl) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const width = Math.max(1, Math.floor(canvas.value.clientWidth * dpr))
  const height = Math.max(1, Math.floor(canvas.value.clientHeight * dpr))
  if (canvas.value.width !== width || canvas.value.height !== height) {
    canvas.value.width = width
    canvas.value.height = height
    gl.viewport(0, 0, width, height)
  }
}

function frame(now) {
  raf = window.requestAnimationFrame(frame)
  if (!gl || !program || !visible || document.hidden) return
  resize()
  if (!start) start = now
  gl.useProgram(program)
  gl.uniform1f(uniforms.time, (now - start) / 1000)
  gl.uniform2f(uniforms.resolution, canvas.value.width, canvas.value.height)
  gl.uniform1f(uniforms.intensity, props.intensity)
  gl.uniform1f(uniforms.reduce, reduce ? 1 : 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  if (reduce) {
    window.cancelAnimationFrame(raf)
    raf = 0
  }
}

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!setup()) return
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  }, { threshold: 0.05 })
  observer.observe(canvas.value)
  raf = window.requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(raf)
  observer?.disconnect()
  if (gl && program) gl.deleteProgram(program)
  if (gl && buffer) gl.deleteBuffer(buffer)
})
</script>

<template>
  <canvas ref="canvas" class="shader-layer" aria-hidden="true" />
</template>

<style scoped>
.shader-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: soft-light;
}
</style>
