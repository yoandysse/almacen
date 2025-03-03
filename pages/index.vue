<template>
  <div>
    <h1 class="text-h4 mb-6">Dashboard</h1>
    
    <v-row>
      <!-- KPI Cards -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" theme="dark">
          <v-card-text>
            <div class="text-overline mb-1">Total Products</div>
            <div class="text-h4 mb-2">{{ productStore.products.length }}</div>
            <v-icon icon="mdi-food-apple"></v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="secondary" theme="dark">
          <v-card-text>
            <div class="text-overline mb-1">Total Inventory</div>
            <div class="text-h4 mb-2">{{ productStore.getTotalInventoryCount }}</div>
            <v-icon icon="mdi-package-variant-closed"></v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" theme="dark">
          <v-card-text>
            <div class="text-overline mb-1">Inventory Value</div>
            <div class="text-h4 mb-2">${{ formatCurrency(productStore.getTotalInventoryValue) }}</div>
            <v-icon icon="mdi-cash"></v-icon>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="error" theme="dark">
          <v-card-text>
            <div class="text-overline mb-1">Low Stock Items</div>
            <div class="text-h4 mb-2">{{ productStore.getLowStockProducts.length }}</div>
            <v-icon icon="mdi-alert-circle"></v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-6">
      <!-- Charts -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Category Distribution
          </v-card-title>
          <v-card-text>
            <CategoryDistributionChart />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            Inventory Movements
          </v-card-title>
          <v-card-text>
            <InventoryMovementsChart />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-6">
      <!-- Recent Activity and Alerts -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-history</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                v-for="movement in recentMovements"
                :key="movement.id"
                :title="movement.productName"
                :subtitle="`${formatMovementType(movement.type)}: ${movement.quantity} units on ${formatDate(movement.date)}`"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getMovementColor(movement.type)" size="36">
                    <v-icon color="white">{{ getMovementIcon(movement.type) }}</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
              
              <v-list-item v-if="recentMovements.length === 0">
                <v-list-item-title>No recent activity</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-alert</v-icon>
            Alerts
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab value="expiring">Expiring Soon</v-tab>
              <v-tab value="lowStock">Low Stock</v-tab>
            </v-tabs>
            
            <v-window v-model="activeTab">
              <v-window-item value="expiring">
                <v-list lines="two">
                  <v-list-item
                    v-for="product in expiringProducts"
                    :key="product.id"
                    :title="product.name"
                    :subtitle="`Expires on ${formatDate(product.expiryDate)}`"
                    @click="navigateToProduct(product.id)"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="warning" size="36">
                        <v-icon color="white">mdi-calendar-alert</v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                  
                  <v-list-item v-if="expiringProducts.length === 0">
                    <v-list-item-title>No products expiring soon</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-window-item>
              
              <v-window-item value="lowStock">
                <v-list lines="two">
                  <v-list-item
                    v-for="product in lowStockProducts"
                    :key="product.id"
                    :title="product.name"
                    :subtitle="`Current stock: ${product.stock} (Min: ${product.minStock})`"
                    @click="navigateToProduct(product.id)"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="error" size="36">
                        <v-icon color="white">mdi-package-variant-closed-alert</v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                  
                  <v-list-item v-if="lowStockProducts.length === 0">
                    <v-list-item-title>No products with low stock</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '~/stores/product';
import { useInventoryStore } from '~/stores/inventory';

const router = useRouter();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

const activeTab = ref('expiring');

const expiringProducts = computed(() => productStore.getExpiringProducts);
const lowStockProducts = computed(() => productStore.getLowStockProducts);
const recentMovements = computed(() => inventoryStore.getRecentMovements(5));

function navigateToProduct(id) {
  router.push(`/products/${id}`);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatCurrency(value) {
  return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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

function getMovementIcon(type) {
  switch (type) {
    case 'initial': return 'mdi-package-variant-plus';
    case 'addition': return 'mdi-plus-circle';
    case 'reduction': return 'mdi-minus-circle';
    case 'adjustment': return 'mdi-sync';
    default: return 'mdi-package-variant';
  }
}
</script>