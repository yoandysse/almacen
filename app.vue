<template>
  <v-app>
    <v-layout>
      <AppSidebar />
      <v-main>
        <v-container fluid>
          <AlertSystem />
          <NuxtPage />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { useProductStore } from '~/stores/product';
import { useAlertStore } from '~/stores/alert';

// Initialize stores
const productStore = useProductStore();
const alertStore = useAlertStore();

// Load data from localStorage on app start
onMounted(() => {
  productStore.loadProducts();
  
  // Check for alerts every minute
  const checkAlertsInterval = setInterval(() => {
    alertStore.checkExpirationAlerts();
    alertStore.checkLowStockAlerts();
  }, 60000);
  
  // Initial check
  alertStore.checkExpirationAlerts();
  alertStore.checkLowStockAlerts();
  
  // Clear interval on component unmount
  onBeforeUnmount(() => {
    clearInterval(checkAlertsInterval);
  });
});
</script>