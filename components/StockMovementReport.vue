<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-bar</v-icon>
            Stock Movements by Type
          </v-card-title>
          <v-card-text>
            <Bar :data="movementTypeChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            Stock Movement Trends
          </v-card-title>
          <v-card-text>
            <Line :data="movementTrendChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-history</v-icon>
        Stock Movement History
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="movementData"
        item-value="id"
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getMovementColor(item.type)"
            size="small"
          >
            {{ formatMovementType(item.type) }}
          </v-chip>
        </template>
        
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        
        <template v-slot:item.stockChange="{ item }">
          {{ item.previousStock }} → {{ item.newStock }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { useInventoryStore } from '~/stores/inventory';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const props = defineProps({
  params: {
    type: Object,
    required: true
  }
});

const inventoryStore = useInventoryStore();

const headers = [
  { title: 'Product', key: 'productName', align: 'start' },
  { title: 'Type', key: 'type' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Stock Change', key: 'stockChange' },
  { title: 'Date', key: 'date' },
  { title: 'Notes', key: 'notes' }
];

const movementData = computed(() => {
  const startDate = new Date(props.params.startDate);
  const endDate = new Date(props.params.endDate);
  endDate.setHours(23, 59, 59, 999); // Include the entire end date
  
  return inventoryStore.movements
    .filter(movement => {
      const movementDate = new Date(movement.date);
      return movementDate >= startDate && movementDate <= endDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const movementTypeChartData = computed(() => {
  const typeCounts = {
    initial: 0,
    addition: 0,
    reduction: 0,
    adjustment: 0
  };
  
  movementData.value.forEach(movement => {
    typeCounts[movement.type] += movement.quantity;
  });
  
  return {
    labels: ['Initial', 'Additions', 'Reductions', 'Adjustments'],
    datasets: [
      {
        label: 'Quantity',
        data: [typeCounts.initial, typeCounts.addition, typeCounts.reduction, typeCounts.adjustment],
        backgroundColor: ['#2196F3', '#4CAF50', '#FF5252', '#FFC107']
      }
    ]
  };
});

const movementTrendChartData = computed(() => {
  // Group by date
  const dateData = {};
  
  movementData.value.forEach(movement => {
    const date = new Date(movement.date).toLocaleDateString();
    
    if (!dateData[date]) {
      dateData[date] = {
        additions: 0,
        reductions: 0
      };
    }
    
    if (movement.type === 'addition') {
      dateData[date].additions += movement.quantity;
    } else if (movement.type === 'reduction') {
      dateData[date].reductions += movement.quantity;
    }
  });
  
  // Sort dates chronologically
  const sortedDates = Object.keys(dateData).sort((a, b) => new Date(a) - new Date(b));
  
  return {
    labels: sortedDates,
    datasets: [
      {
        label: 'Additions',
        data: sortedDates.map(date => dateData[date].additions),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4
      },
      {
        label: 'Reductions',
        data: sortedDates.map(date => dateData[date].reductions),
        borderColor: '#FF5252',
        backgroundColor: 'rgba(255, 82, 82, 0.2)',
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatMovementType(type) {
  switch (type) {
    case 'initial': return 'Initial Stock';
    case 'addition': return 'Stock Added';
    case 'reduction': return 'Stock Removed';
    case 'adjustment': return 'Stock Adjusted';
    default: return type;
  }
}

function getMovementColor(type) {
  switch (type) {
    case 'initial': return 'info';
    case 'addition': return 'success';
    case 'reduction': return 'error';
    case 'adjustment': return 'warning';
    default: return 'primary';
  }
}
</script>