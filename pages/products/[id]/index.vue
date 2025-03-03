<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-btn icon class="mr-4" @click="navigateBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h4">{{ product?.name || 'Product Details' }}</h1>
      <v-spacer></v-spacer>
      <v-btn color="warning" prepend-icon="mdi-pencil" class="mr-2" @click="navigateToEdit">
        Edit
      </v-btn>
      <v-btn color="error" prepend-icon="mdi-delete" @click="confirmDelete">
        Delete
      </v-btn>
    </div>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-img
            :src="product?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'"
            height="300"
            cover
            :alt="product?.name || 'Product'"
            error-src="https://cdn-icons-png.flaticon.com/512/1147/1147805.png"
          ></v-img>
          
          <v-card-title>
            {{ product?.name }}
            <v-chip
              v-if="product"
              :color="getStockColor(product.stock, product.minStock)"
              class="ml-2"
              size="small"
            >
              {{ getStockStatus(product.stock, product.minStock) }}
            </v-chip>
          </v-card-title>
          
          <v-card-subtitle>
            {{ product?.category }}
          </v-card-subtitle>
          
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-barcode</v-icon>
              </template>
              <v-list-item-title>Barcode/SKU</v-list-item-title>
              <v-list-item-subtitle>{{ product?.barcode || 'N/A' }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon :color="getExpiryColor(product?.expiryDate)">mdi-calendar</v-icon>
              </template>
              <v-list-item-title>Expiry Date</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(product?.expiryDate) }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-cash</v-icon>
              </template>
              <v-list-item-title>Prices</v-list-item-title>
              <v-list-item-subtitle v-if="product">
                Purchase: ${{ product.purchasePrice.toFixed(2) }} | 
                Selling: ${{ product.sellingPrice.toFixed(2) }}
              </v-list-item-subtitle>
              <v-list-item-subtitle v-else>
                Not available
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-truck</v-icon>
              </template>
              <v-list-item-title>Supplier</v-list-item-title>
              <v-list-item-subtitle>{{ product?.supplier || 'N/A' }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>Storage Location</v-list-item-title>
              <v-list-item-subtitle>{{ product?.location || 'N/A' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-package-variant</v-icon>
            Inventory Status
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-h6 mb-2">Current Stock</div>
                <v-progress-linear
                  :model-value="stockPercentage"
                  :color="getStockColor(product?.stock, product?.minStock)"
                  height="25"
                  striped
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ product?.stock }} units</strong>
                  </template>
                </v-progress-linear>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="text-h6 mb-2">Inventory Value</div>
                <div class="d-flex align-center">
                  <v-icon color="success" class="mr-2">mdi-cash-multiple</v-icon>
                  <span class="text-h5">${{ inventoryValue.toFixed(2) }}</span>
                </div>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="d-flex justify-space-between align-center">
              <v-btn color="success" prepend-icon="mdi-plus" @click="showStockDialog('addition')">
                Add Stock
              </v-btn>
              
              <v-btn color="error" prepend-icon="mdi-minus" @click="showStockDialog('reduction')">
                Remove Stock
              </v-btn>
              
              <v-btn color="warning" prepend-icon="mdi-sync" @click="showStockDialog('adjustment')">
                Adjust Stock
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        
        <v-card>
          <v-card-title>
            <v-icon start>mdi-history</v-icon>
            Stock Movement History
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="movements"
            :loading="loading"
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
              {{ formatDate(item.date, true) }}
            </template>
            
            <template v-slot:item.stockChange="{ item }">
              {{ item.previousStock }} → {{ item.newStock }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Stock Adjustment Dialog -->
    <v-dialog v-model="stockDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ stockDialogTitle }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="stockForm" v-model="isStockFormValid" @submit.prevent="processStockChange">
            <v-text-field
              v-model.number="stockChange.quantity"
              :label="stockChangeLabel"
              type="number"
              min="1"
              :rules="[v => v > 0 || 'Quantity must be greater than 0']"
              variant="outlined"
              required
            ></v-text-field>
            
            <v-textarea
              v-model="stockChange.notes"
              label="Notes"
              variant="outlined"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="stockDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" variant="text" @click="processStockChange">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Confirm Delete
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete <strong>{{ product?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteProduct">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductStore } from '~/stores/product';
import { useInventoryStore } from '~/stores/inventory';
import { useAlertStore } from '~/stores/alert';

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();

const loading = ref(false);
const product = ref(null);
const movements = ref([]);
const deleteDialog = ref(false);
const stockDialog = ref(false);
const stockForm = ref(null);
const isStockFormValid = ref(false);
const stockChangeType = ref('');
const stockChange = ref({
  quantity: 1,
  notes: ''
});

const headers = [
  { title: 'Type', key: 'type' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Stock Change', key: 'stockChange' },
  { title: 'Date', key: 'date' },
  { title: 'Notes', key: 'notes' }
];

const inventoryValue = computed(() => {
  if (!product.value) return 0;
  return product.value.stock * product.value.purchasePrice;
});

const stockPercentage = computed(() => {
  if (!product.value || product.value.minStock === 0) return 100;
  return Math.min(100, (product.value.stock / (product.value.minStock * 2)) * 100);
});

const stockDialogTitle = computed(() => {
  switch (stockChangeType.value) {
    case 'addition': return 'Add Stock';
    case 'reduction': return 'Remove Stock';
    case 'adjustment': return 'Adjust Stock';
    default: return 'Modify Stock';
  }
});

const stockChangeLabel = computed(() => {
  switch (stockChangeType.value) {
    case 'addition': return 'Quantity to Add';
    case 'reduction': return 'Quantity to Remove';
    case 'adjustment': return 'New Stock Level';
    default: return 'Quantity';
  }
});

onMounted(() => {
  loadProductData();
});

function loadProductData() {
  const productId = route.params.id;
  product.value = productStore.getProductById(productId);
  
  if (!product.value) {
    alertStore.setAlert({
      message: 'Product not found',
      type: 'error'
    });
    navigateBack();
    return;
  }
  
  // Load movement history
  movements.value = inventoryStore.getMovementsByProductId(productId);
}

function navigateBack() {
  router.push('/products');
}

function navigateToEdit() {
  router.push(`/products/${route.params.id}/edit`);
}

function confirmDelete() {
  deleteDialog.value = true;
}

function deleteProduct() {
  if (product.value) {
    productStore.deleteProduct(product.value.id);
    alertStore.setAlert({
      message: `Product "${product.value.name}" has been deleted`,
      type: 'success'
    });
    deleteDialog.value = false;
    navigateBack();
  }
}

function showStockDialog(type) {
  stockChangeType.value = type;
  
  // Reset form
  stockChange.value = {
    quantity: type === 'adjustment' ? product.value.stock : 1,
    notes: ''
  };
  
  stockDialog.value = true;
}

function processStockChange() {
  if (!isStockFormValid.value && stockChangeType.value !== 'adjustment') {
    alertStore.setAlert({
      message: 'Please enter a valid quantity',
      type: 'error'
    });
    return;
  }
  
  try {
    if (stockChangeType.value === 'adjustment') {
      // For adjustment, we calculate the difference
      const difference = stockChange.value.quantity - product.value.stock;
      
      if (difference > 0) {
        productStore.adjustStock(
          product.value.id,
          Math.abs(difference),
          'addition',
          stockChange.value.notes || 'Stock adjustment'
        );
      } else if (difference < 0) {
        productStore.adjustStock(
          product.value.id,
          Math.abs(difference),
          'reduction',
          stockChange.value.notes || 'Stock adjustment'
        );
      }
    } else {
      productStore.adjustStock(
        product.value.id,
        stockChange.value.quantity,
        stockChangeType.value,
        stockChange.value.notes || `Stock ${stockChangeType.value}`
      );
    }
    
    // Reload data
    loadProductData();
    
    alertStore.setAlert({
      message: 'Stock updated successfully',
      type: 'success'
    });
    
    stockDialog.value = false;
  } catch (error) {
    alertStore.setAlert({
      message: `Error updating stock: ${error.message}`,
      type: 'error'
    });
  }
}

function formatDate(dateString, includeTime = false) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (includeTime) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
}

function getExpiryColor(dateString) {
  if (!dateString) return 'grey';
  
  const today = new Date();
  const expiryDate = new Date(dateString);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  if (expiryDate < today) {
    return 'error';
  } else if (expiryDate <= thirtyDaysFromNow) {
    return 'warning';
  } else {
    return 'success';
  }
}

function getStockColor(stock, minStock) {
  if (!stock || !minStock) return 'grey';
  
  if (stock === 0) {
    return 'error';
  } else if (stock <= minStock) {
    return 'warning';
  } else {
    return 'success';
  }
}

function getStockStatus(stock, minStock) {
  if (stock === 0) {
    return 'Out of Stock';
  } else if (stock <= minStock) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
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