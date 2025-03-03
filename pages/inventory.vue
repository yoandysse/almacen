<template>
  <div>
    <h1 class="text-h4 mb-6">Inventory Movements</h1>
    
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" sm="3">
            <v-select
              v-model="typeFilter"
              :items="['All Types', 'Initial', 'Addition', 'Reduction', 'Adjustment']"
              label="Movement Type"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="5">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="dateRange.start"
                  label="From Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="dateRange.end"
                  label="To Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredMovements"
        :search="search"
        :loading="loading"
        item-value="id"
        hover
      >
        <template v-slot:item.productName="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-2">
              <v-img :src="getProductImage(item.productId)" :alt="item.productName" error-src="https://cdn-icons-png.flaticon.com/512/1147/1147805.png" />
            </v-avatar>
            <span>{{ item.productName }}</span>
          </div>
        </template>
        
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
          <div class="d-flex align-center">
            <v-icon
              :color="item.type === 'addition' ? 'success' : 'error'"
              size="small"
              class="mr-1"
            >
              {{ item.type === 'addition' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
            </v-icon>
            {{ item.previousStock }} → {{ item.newStock }}
          </div>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="navigateToProduct(item.productId)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    
    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-chart-timeline-variant</v-icon>
        Inventory Movement Trends
      </v-card-title>
      <v-card-text>
        <InventoryMovementsChart />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '~/stores/inventory';
import { useProductStore } from '~/stores/product';

const router = useRouter();
const inventoryStore = useInventoryStore();
const productStore = useProductStore();

const search = ref('');
const typeFilter = ref('All Types');
const loading = ref(false);
const dateRange = ref({
  start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substr(0, 10), // 1 month ago
  end: new Date().toISOString().substr(0, 10) // today
});

const headers = [
  { title: 'Product', key: 'productName', align: 'start' },
  { title: 'Type', key: 'type' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Stock Change', key: 'stockChange' },
  { title: 'Date', key: 'date' },
  { title: 'Notes', key: 'notes' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const filteredMovements = computed(() => {
  let filtered = [...inventoryStore.movements];
  
  // Apply type filter
  if (typeFilter.value !== 'All Types') {
    const type = typeFilter.value.toLowerCase();
    filtered = filtered.filter(movement => movement.type === type);
  }
  
  // Apply date range filter
  if (dateRange.value.start && dateRange.value.end) {
    const start = new Date(dateRange.value.start).getTime();
    const end = new Date(dateRange.value.end).getTime() + (24 * 60 * 60 * 1000); // Include the end date
    
    filtered = filtered.filter(movement => {
      const movementDate = new Date(movement.date).getTime();
      return movementDate >= start && movementDate <= end;
    });
  }
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

function navigateToProduct(id) {
  router.push(`/products/${id}`);
}

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

function getProductImage(productId) {
  const product = productStore.getProductById(productId);
  return product?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png';
}
</script>