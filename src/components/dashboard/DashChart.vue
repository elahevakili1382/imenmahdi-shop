<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  type: { type: String, required: true },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
})

const canvas = ref(null)
let chart

function areaFill(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, 'rgba(48, 209, 88, 0.35)')
  gradient.addColorStop(1, 'rgba(0, 229, 255, 0.02)')
  return gradient
}

function withTheme(data, ctx) {
  if (props.type !== 'line') return data
  return {
    ...data,
    datasets: (data.datasets || []).map((dataset) => ({
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      borderColor: '#00E5FF',
      pointRadius: 0,
      pointHoverRadius: 4,
      ...dataset,
      backgroundColor: dataset.backgroundColor || areaFill(ctx),
    })),
  }
}

function render() {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: props.type,
    data: withTheme(props.data, ctx),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#98989D', boxWidth: 10, font: { family: 'Inter, Vazirmatn Variable, sans-serif' } },
        },
        tooltip: {
          backgroundColor: '#1E1E1E',
          borderColor: '#2C2C2E',
          borderWidth: 1,
          titleColor: '#FFFFFF',
          bodyColor: '#98989D',
        },
      },
      ...(props.type === 'doughnut'
        ? {}
        : {
            scales: {
              x: {
                ticks: { color: '#98989D' },
                grid: { color: '#2C2C2E' },
                border: { display: false },
              },
              y: {
                ticks: { color: '#98989D' },
                grid: { color: '#2C2C2E' },
                border: { display: false },
                beginAtZero: true,
              },
            },
          }),
      ...props.options,
    },
  })
}

onMounted(render)
watch(() => [props.data, props.type], render, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="h-64">
    <canvas ref="canvas"></canvas>
  </div>
</template>
