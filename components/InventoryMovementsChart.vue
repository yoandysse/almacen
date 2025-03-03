<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useInventoryStore } from '~/stores/inventory';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const inventoryStore = useInventoryStore();

const chartData = computed(() => {
  const totals = inventoryStore.getTotalMovementsByType;
  
  return {
    labels: ['Initial', 'Additions', 'Reductions', 'Adjustments'],
    datasets: [
      {
        label: 'Quantity',
        data: [totals.initial, totals.addition, totals.reduction, totals.adjustment],
        backgroundColor: ['#2196F3', '#4CAF50', '#FF5252', '#FFC107']
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Inventory Movements',
      font: {
        size: 16
      }
    }
  }
};
</script>