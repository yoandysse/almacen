<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Low Stock by Category
          </v-card-title>
          <v-card-text>
            <Pie :data="categoryChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-bar</v-icon>
            Top 5 Products Needing Restock
          </v-card-title>
          <v-card-text>
            <Bar :data="restockChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-alert</v-icon>
        Low Stock Products
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="lowStockData"
        item-value="id"
      >
        <template v-slot:item.stock="{ item }">
          <v-progress-linear
            :model-value="(item.stock / item.minStock) * 100"
            :color="getStockColor(item.stock, item.minStock)"
            height="20"
            striped
          >
            <template v-slot:default="{ value }">
              <span class="white--text">{{ item.stock }} / {{ item.minStock }} ({{ Math.round(value) }}%)</span>
            </template>
          </v-progress-linear>
        </template>
        
        <template v-slot:item.reorderAmount="{ item }">
          <v-chip
            color="error"
            size="small"
          >
            {{ item.reorderAmount }}
          </v-chip>
        </template>
        
        <template v-slot:item.reorderValue="{ item }">
          ${{ item.reorderValue.toFixed(2) }}
        </template>
      </v-data-table>
      
      <v-card-text>
        <div class="d-flex justify-end">
          <div class="text-h6">
            Total Reorder Value: <span class="font-weight-bold">${{ totalReorderValue.toFixed(2) }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pie, Bar } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useProductStore } from '~/stores/product';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

const productStore = useProductStore();

const headers = [
  { title: 'Product', key: 'name', align: 'start' },
  { title: 'Category', key: 'category' },
  { title: 'Stock Level', key: 'stock' },
  { title: 'Reorder Amount', key: 'reorderAmount' },
  { title: 'Reorder Value', key: 'reorderValue' },
  { title: 'Supplier', key: 'supplier' }
];

const lowStockData = computed(() => {
  let products = productStore.getLowStockProducts;
  
  // Filter by categories if specified
  if (props.params.categories && props.params.categories.length > 0) {
    products = products.filter(product => props.params.categories.includes(product.category));
  }
  
  return products.map(product => {
    const reorderAmount = Math.max(0, product.minStock - product.stock);
    
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      reorderAmount,
      reorderValue: reorderAmount * product.purchasePrice,
      supplier: product.supplier
    };
  }).sort((a, b) => b.reorderAmount - a.reorderAmount);
});

const totalReorderValue = computed(() => {
  return lowStockData.value.reduce((total, item) => total + item.reorderValue, 0);
});

const categoryChartData = computed(() => {
  const categoryData = {};
  
  lowStockData.value.forEach(item => {
    if (!categoryData[item.category]) {
      categoryData[item.category] = 0;
    }
    
    categoryData[item.category] += 1;
  });
  
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);
  
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

const restockChartData = computed(() => {
  const topProducts = lowStockData.value.slice(0, 5);
  
  return {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Reorder Amount',
        data: topProducts.map(p => p.reorderAmount),
        backgroundColor: '#FF5252'
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
    }
  }
};

function getStockColor(stock, minStock) {
  const percentage = (stock / minStock) * 100;
  
  if (percentage <= 25) {
    return 'error';
  } else if (percentage <= 75) {
    return 'warning';
  } else {
    return 'success';
  }
}
</script>