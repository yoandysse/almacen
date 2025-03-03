<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Value Distribution by Category
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
            Top 5 Products by Value
          </v-card-title>
          <v-card-text>
            <Bar :data="productChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-cash</v-icon>
        Inventory Valuation
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="valuationData"
        item-value="id"
      >
        <template v-slot:item.totalValue="{ item }">
          ${{ item.totalValue.toFixed(2) }}
        </template>
        
        <template v-slot:item.purchasePrice="{ item }">
          ${{ item.purchasePrice.toFixed(2) }}
        </template>
      </v-data-table>
      
      <v-card-text>
        <div class="d-flex justify-end">
          <div class="text-h6">
            Total Inventory Value: <span class="font-weight-bold">${{ totalValue.toFixed(2) }}</span>
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
  { title: 'Stock', key: 'stock' },
  { title: 'Purchase Price', key: 'purchasePrice' },
  { title: 'Total Value', key: 'totalValue' }
];

const valuationData = computed(() => {
  let products = [...productStore.products];
  
  // Filter by categories if specified
  if (props.params.categories && props.params.categories.length > 0) {
    products = products.filter(product => props.params.categories.includes(product.category));
  }
  
  return products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    stock: product.stock,
    purchasePrice: product.purchasePrice,
    totalValue: product.stock * product.purchasePrice
  })).sort((a, b) => b.totalValue - a.totalValue);
});

const totalValue = computed(() => {
  return valuationData.value.reduce((total, item) => total + item.totalValue, 0);
});

const categoryChartData = computed(() => {
  const categoryValues = {};
  
  valuationData.value.forEach(item => {
    if (!categoryValues[item.category]) {
      categoryValues[item.category] = 0;
    }
    categoryValues[item.category] += item.totalValue;
  });
  
  const labels = Object.keys(categoryValues);
  const data = Object.values(categoryValues);
  
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

const productChartData = computed(() => {
  const topProducts = valuationData.value.slice(0, 5);
  
  return {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Value ($)',
        data: topProducts.map(p => p.totalValue),
        backgroundColor: '#1867C0'
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
</script>