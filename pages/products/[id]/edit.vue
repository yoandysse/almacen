<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-btn icon class="mr-4" @click="navigateBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h4">Edit Product</h1>
    </div>
    
    <v-form ref="form" v-model="isFormValid" @submit.prevent="saveProduct">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="product.name"
                label="Product Name"
                :rules="[v => !!v || 'Name is required']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="product.barcode"
                label="Barcode/SKU"
                variant="outlined"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="product.category"
                :items="productStore.categories"
                label="Category"
                :rules="[v => !!v || 'Category is required']"
                variant="outlined"
                required
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="product.expiryDate"
                label="Expiry Date"
                type="date"
                :rules="[v => !!v || 'Expiry date is required']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="product.stock"
                label="Current Stock"
                type="number"
                min="0"
                :rules="[v => v >= 0 || 'Stock cannot be negative']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="product.minStock"
                label="Minimum Stock"
                type="number"
                min="0"
                :rules="[v => v >= 0 || 'Minimum stock cannot be negative']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="product.purchasePrice"
                label="Purchase Price"
                type="number"
                prefix="$"
                min="0"
                step="0.01"
                :rules="[v => v >= 0 || 'Price cannot be negative']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="product.sellingPrice"
                label="Selling Price"
                type="number"
                prefix="$"
                min="0"
                step="0.01"
                :rules="[v => v >= 0 || 'Price cannot be negative']"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="product.supplier"
                :items="productStore.suppliers"
                label="Supplier"
                variant="outlined"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="product.location"
                :items="productStore.locations"
                label="Storage Location"
                variant="outlined"
              ></v-select>
            </v-col>
            
            <v-col cols="12">
              <v-text-field
                v-model="product.imageUrl"
                label="Image URL"
                variant="outlined"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" class="d-flex justify-center">
              <v-img
                :src="product.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'"
                max-width="200"
                aspect-ratio="1"
                class="rounded"
                :alt="product.name || 'Product'"
                error-src="https://cdn-icons-png.flaticon.com/512/1147/1147805.png"
              ></v-img>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="navigateBack">
            Cancel
          </v-btn>
          <v-btn color="primary" type="submit" :loading="loading">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductStore } from '~/stores/product';
import { useAlertStore } from '~/stores/alert';

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const alertStore = useAlertStore();

const form = ref(null);
const isFormValid = ref(false);
const loading = ref(false);
const product = reactive({
  name: '',
  barcode: '',
  category: '',
  expiryDate: '',
  stock: 0,
  minStock: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  supplier: '',
  location: '',
  imageUrl: ''
});

onMounted(() => {
  const productId = route.params.id;
  const existingProduct = productStore.getProductById(productId);
  
  if (!existingProduct) {
    alertStore.setAlert({
      message: 'Product not found',
      type: 'error'
    });
    navigateBack();
    return;
  }
  
  // Populate form with existing product data
  Object.keys(product).forEach(key => {
    product[key] = existingProduct[key];
  });
});

function saveProduct() {
  if (!isFormValid.value) {
    alertStore.setAlert({
      message: 'Please fill all required fields correctly',
      type: 'error'
    });
    return;
  }
  
  loading.value = true;
  
  try {
    const productId = route.params.id;
    productStore.updateProduct(productId, { ...product });
    
    alertStore.setAlert({
      message: 'Product updated successfully',
      type: 'success'
    });
    
    navigateBack();
  } catch (error) {
    alertStore.setAlert({
      message: `Error updating product: ${error.message}`,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
}

function navigateBack() {
  router.push(`/products/${route.params.id}`);
}
</script>