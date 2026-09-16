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
  gradient.addColorStop(0, 'rgba(27, 143, 90, 0.32)')
  gradient.addColorStop(1, 'rgba(27, 143, 90, 0.02)')
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
      borderColor: '#1B8F5A',
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
          display: false,
          labels: {
            color: '#64748B',
            boxWidth: 10,
            font: { family: 'Vazirmatn Variable, Vazirmatn, sans-serif' },
          },
        },
        tooltip: {
          backgroundColor: '#ffffff',
          borderColor: '#E8ECEF',
          borderWidth: 1,
          titleColor: '#0F172A',
          bodyColor: '#64748B',
          padding: 10,
        },
      },
      ...(props.type === 'doughnut'
        ? {}
        : {
            scales: {
              x: {
                ticks: { color: '#64748B' },
                grid: { display: false },
                border: { display: false },
              },
              y: {
                ticks: { color: '#64748B' },
                grid: { color: '#EEF2F4' },
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
