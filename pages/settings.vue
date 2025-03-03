<template>
  <div>
    <h1 class="text-h4 mb-6">Settings</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-tag</v-icon>
            Product Categories
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(category, index) in productStore.categories"
                :key="index"
              >
                <v-list-item-title>{{ category }}</v-list-item-title>
                
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="confirmDelete(category, 'category', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4"></v-divider>
            
            <v-form @submit.prevent="addCategory">
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="newCategory"
                    label="New Category"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="primary"
                    block
                    @click="addCategory"
                    :disabled="!newCategory"
                  >
                    Add
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-truck</v-icon>
            Suppliers
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(supplier, index) in productStore.suppliers"
                :key="index"
              >
                <v-list-item-title>{{ supplier }}</v-list-item-title>
                
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="confirmDelete(supplier, 'supplier', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4"></v-divider>
            
            <v-form @submit.prevent="addSupplier">
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="newSupplier"
                    label="New Supplier"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="primary"
                    block
                    @click="addSupplier"
                    :disabled="!newSupplier"
                  >
                    Add
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-map-marker</v-icon>
            Storage Locations
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(location, index) in productStore.locations"
                :key="index"
              >
                <v-list-item-title>{{ location }}</v-list-item-title>
                
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="confirmDelete(location, 'location', index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            
            <v-divider class="my-4"></v-divider>
            
            <v-form @submit.prevent="addLocation">
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="newLocation"
                    label="New Location"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="primary"
                    block
                    @click="addLocation"
                    :disabled="!newLocation"
                  >
                    Add
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-bell</v-icon>
            Alert Settings
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Expiry Alert Threshold</v-list-item-title>
                <v-list-item-subtitle>
                  Alert when products are expiring within {{ expiryThreshold }} days
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-slider
                    v-model="expiryThreshold"
                    min="1"
                    max="90"
                    step="1"
                    thumb-label
                    class="w-50"
                  ></v-slider>
                </template>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Low Stock Alert</v-list-item-title>
                <v-list-item-subtitle>
                  Alert when stock falls below minimum level
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-switch v-model="lowStockAlert" color="primary"></v-switch>
                </template>
              </v-list-item>
            </v-list>
            
            <v-btn
              color="primary"
              block
              class="mt-4"
              @click="saveAlertSettings"
            >
              Save Alert Settings
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12">
        <v-card>
          <v-card-title class="bg-error text-white">
            <v-icon start color="white">mdi-delete-forever</v-icon>
            Danger Zone
          </v-card-title>
          
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="text-h6">Clear All Data</div>
                <div class="text-body-1">
                  This will permanently delete all products and inventory movements. This action cannot be undone.
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-right">
                <v-btn
                  color="error"
                  @click="confirmClearData"
                >
                  Clear All Data
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Confirm Delete
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete <strong>{{ itemToDelete }}</strong>? This may affect existing products.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteItem">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Clear Data Confirmation Dialog -->
    <v-dialog v-model="clearDataDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          Danger: Clear All Data
        </v-card-title>
        
        <v-card-text class="pt-4">
          <p>This action will permanently delete all your data, including:</p>
          <ul>
            <li>All products</li>
            <li>All inventory movements</li>
            <li>All historical data</li>
          </ul>
          <p class="font-weight-bold">This action CANNOT be undone!</p>
          
          <v-text-field
            v-model="deleteConfirmation"
            label="Type DELETE to confirm"
            variant="outlined"
            class="mt-4"
          ></v-text-field>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="clearDataDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="clearAllData"
            :disabled="deleteConfirmation !== 'DELETE'"
          >
            Clear All Data
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useProductStore } from '~/stores/product';
import { useInventoryStore } from '~/stores/inventory';
import { useAlertStore } from '~/stores/alert';

const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();

const newCategory = ref('');
const newSupplier = ref('');
const newLocation = ref('');
const expiryThreshold = ref(30);
const lowStockAlert = ref(true);

const deleteDialog = ref(false);
const itemToDelete = ref('');
const deleteType = ref('');
const deleteIndex = ref(-1);

const clearDataDialog = ref(false);
const deleteConfirmation = ref('');

function addCategory() {
  if (!newCategory.value) return;
  
  if (!productStore.categories.includes(newCategory.value)) {
    productStore.categories.push(newCategory.value);
    alertStore.setAlert({
      message: `Category "${newCategory.value}" added successfully`,
      type: 'success'
    });
    newCategory.value = '';
  } else {
    alertStore.setAlert({
      message: 'This category already exists',
      type: 'error'
    });
  }
}

function addSupplier() {
  if (!newSupplier.value) return;
  
  if (!productStore.suppliers.includes(newSupplier.value)) {
    productStore.suppliers.push(newSupplier.value);
    alertStore.setAlert({
      message: `Supplier "${newSupplier.value}" added successfully`,
      type: 'success'
    });
    newSupplier.value = '';
  } else {
    alertStore.setAlert({
      message: 'This supplier already exists',
      type: 'error'
    });
  }
}

function addLocation() {
  if (!newLocation.value) return;
  
  if (!productStore.locations.includes(newLocation.value)) {
    productStore.locations.push(newLocation.value);
    alertStore.setAlert({
      message: `Location "${newLocation.value}" added successfully`,
      type: 'success'
    });
    newLocation.value = '';
  } else {
    alertStore.setAlert({
      message: 'This location already exists',
      type: 'error'
    });
  }
}

function saveAlertSettings() {
  // In a real app, these would be saved to user preferences
  // For now, we'll just show a success message
  alertStore.setAlert({
    message: 'Alert settings saved successfully',
    type: 'success'
  });
}

function confirmDelete(item, type, index) {
  itemToDelete.value = item;
  deleteType.value = type;
  deleteIndex.value = index;
  deleteDialog.value = true;
}

function deleteItem() {
  if (deleteType.value === 'category') {
    productStore.categories.splice(deleteIndex.value, 1);
    alertStore.setAlert({
      message: `Category "${itemToDelete.value}" deleted successfully`,
      type: 'success'
    });
  } else if (deleteType.value === 'supplier') {
    productStore.suppliers.splice(deleteIndex.value, 1);
    alertStore.setAlert({
      message: `Supplier "${itemToDelete.value}" deleted successfully`,
      type: 'success'
    });
  } else if (deleteType.value === 'location') {
    productStore.locations.splice(deleteIndex.value, 1);
    alertStore.setAlert({
      message: `Location "${itemToDelete.value}" deleted successfully`,
      type: 'success'
    });
  }
  
  deleteDialog.value = false;
  itemToDelete.value = '';
  deleteType.value = '';
  deleteIndex.value = -1;
}

function confirmClearData() {
  clearDataDialog.value = true;
  deleteConfirmation.value = '';
}

function clearAllData() {
  if (deleteConfirmation.value !== 'DELETE') return;
  
  // Clear all data
  localStorage.removeItem('food-inventory-products');
  localStorage.removeItem('food-inventory-movements');
  
  // Reset stores
  productStore.products = [];
  inventoryStore.movements = [];
  
  alertStore.setAlert({
    message: 'All data has been cleared successfully',
    type: 'success'
  });
  
  clearDataDialog.value = false;
  deleteConfirmation.value = '';
}
</script>