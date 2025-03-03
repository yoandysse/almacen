<template>
  <div>
    <v-snackbar
      v-model="showAlert"
      :color="currentAlert?.type || 'info'"
      :timeout="5000"
      location="top"
    >
      {{ currentAlert?.message || '' }}
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showAlert = false"
        >
          Close
        </v-btn>
        <v-btn
          v-if="currentAlert?.actionText"
          variant="text"
          @click="handleAction"
        >
          {{ currentAlert?.actionText }}
        </v-btn>
      </template>
    </v-snackbar>
    
    <v-dialog v-model="showAlertDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon :color="alertDialogType === 'expiration' ? 'error' : 'warning'" class="mr-2">
            {{ alertDialogType === 'expiration' ? 'mdi-alert-circle' : 'mdi-alert' }}
          </v-icon>
          {{ alertDialogType === 'expiration' ? 'Expiration Alerts' : 'Low Stock Alerts' }}
        </v-card-title>
        
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="alert in alertItems"
              :key="alert.id"
              :title="alert.name"
              :subtitle="alertDialogType === 'expiration' 
                ? `Expires on ${formatDate(alert.expiryDate)}` 
                : `Current stock: ${alert.stock} (Min: ${alert.minStock})`"
              @click="navigateToProduct(alert.id)"
            >
              <template v-slot:prepend>
                <v-avatar :color="alertDialogType === 'expiration' ? 'error' : 'warning'" size="36">
                  <v-icon color="white">
                    {{ alertDialogType === 'expiration' ? 'mdi-calendar-alert' : 'mdi-package-variant-closed-alert' }}
                  </v-icon>
                </v-avatar>
              </template>
            </v-list-item>
            
            <v-list-item v-if="alertItems.length === 0">
              <v-list-item-title>No alerts found</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showAlertDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAlertStore } from '~/stores/alert';

const router = useRouter();
const alertStore = useAlertStore();

const showAlert = ref(false);
const showAlertDialog = ref(false);
const alertDialogType = ref('');
const alertItems = ref([]);

const currentAlert = computed(() => alertStore.currentAlert);

// Watch for new alerts
watch(() => alertStore.currentAlert, (newAlert) => {
  if (newAlert && newAlert.message) {
    showAlert.value = true;
  }
});

function handleAction() {
  if (currentAlert.value && currentAlert.value.action === 'showExpirationAlerts') {
    alertDialogType.value = 'expiration';
    alertItems.value = alertStore.expirationAlerts;
    showAlertDialog.value = true;
  } else if (currentAlert.value && currentAlert.value.action === 'showLowStockAlerts') {
    alertDialogType.value = 'lowStock';
    alertItems.value = alertStore.lowStockAlerts;
    showAlertDialog.value = true;
  }
  
  showAlert.value = false;
}

function navigateToProduct(id) {
  router.push(`/products/${id}`);
  showAlertDialog.value = false;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
</script>