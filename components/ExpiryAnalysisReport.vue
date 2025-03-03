<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            Products Expiring by Month
          </v-card-title>
          <v-card-text>
            <Bar :data="expiryChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Expiring Products by Category
          </v-card-title>
          <v-card-text>
            <Pie :data="categoryChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-calendar-alert</v-icon>
        Expiring Products
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="expiryData"
        item-value="id"
      >
        <template v-slot:item.expiryDate="{ item }">
          <v-chip
            :color="getExpiryColor(item.daysUntilExpiry)"
            size="small"
          >
            {{ formatDate(item.expiryDate) }}
          </v-chip>
        </template>
        
        <template v-slot:item.daysUntilExpiry="{ item }">
          <v-chip
            :color="getExpiryColor(item.daysUntilExpiry)"
            size="small"
          >
            {{ item.daysUntilExpiry }} days
          </v-chip>
        </template>
        
        <template v-slot:item.totalValue="{ item }">
          ${{ item.totalValue.toFixed(2) }}
        </template>
      </v-data-table>
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
  { title: 'Expiry Date', key: 'expiryDate' },
  { title: 'Days Until Expiry', key: 'daysUntilExpiry' },
  { title: 'Stock', key: 'stock' },
  { title: 'Total Value', key: 'totalValue' }
];

const expiryData = computed(() => {
  const startDate = new Date(props.params.startDate);
  const endDate = new Date(props.params.endDate);
  let products = [...productStore.products];
  
  // Filter by date range and categories
  products = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    const inDateRange = expiryDate >= startDate && expiryDate <= endDate;
    const inCategories = !props.params.categories.length || props.params.categories.includes(product.category);
    return inDateRange && inCategories;
  });
  
  const today = new Date();
  
  return products.map(product => {
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      expiryDate: product.expiryDate,
      daysUntilExpiry,
      stock: product.stock,
      totalValue: product.stock * product.purchasePrice
    };
  }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
});

const expiryChartData = computed(() => {
  // Group by month
  const monthlyData = {};
  
  expiryData.value.forEach(item => {
    const date = new Date(item.expiryDate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    
    monthlyData[monthYear] += 1;
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.split('/').map(Number);
    const [bMonth, bYear] = b.split('/').map(Number);
    
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
  
  return {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Products Expiring',
        data: sortedMonths.map(month => monthlyData[month]),
        backgroundColor: '#FF5252'
      }
    ]
  };
});

const categoryChartData = computed(() => {
  const categoryData = {};
  
  expiryData.value.forEach(item => {
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    }
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function getExpiryColor(daysUntilExpiry) {
  if (daysUntilExpiry < 0) {
    return 'error';
  } else if (daysUntilExpiry <= 30) {
    return 'warning';
  } else {
    return 'success';
  }
}
</script>