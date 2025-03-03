<template>
  <div>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useProductStore } from '~/stores/product';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const productStore = useProductStore();

const chartData = computed(() => {
  const distribution = productStore.getCategoryDistribution;
  const labels = Object.keys(distribution);
  const data = Object.values(distribution);
  
  // Generate colors
  const backgroundColors = [
    '#4CAF50', '#2196F3', '#FFC107', '#FF5252', '#9C27B0',
    '#00BCD4', '#FF9800', '#607D8B', '#E91E63', '#3F51B5'
  ];
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    },
    title: {
      display: true,
      text: 'Products by Category',
      font: {
        size: 16
      }
    }
  }
};
</script>