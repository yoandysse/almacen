<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Products</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="navigateToAddProduct">
        Add Product
      </v-btn>
    </div>
    
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="12" sm="6" md="4">
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
          
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="categoryFilter"
              :items="['All Categories', ...productStore.categories]"
              label="Category"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="stockFilter"
              :items="stockFilterOptions"
              label="Stock Status"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="6" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-export"
              @click="exportData"
              block
            >
              Export
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :search="search"
        :loading="loading"
        item-value="id"
        hover
      >
        <template v-slot:item.imageUrl="{ item }">
          <v-avatar size="40">
            <v-img 
              :src="item.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'" 
              :alt="item.name"
              error-src="https://cdn-icons-png.flaticon.com/512/1147/1147805.png" 
            />
          </v-avatar>
        </template>
        
        <template v-slot:item.expiryDate="{ item }">
          <v-chip
            :color="getExpiryColor(item.expiryDate)"
            size="small"
          >
            {{ formatDate(item.expiryDate) }}
          </v-chip>
        </template>
        
        <template v-slot:item.stock="{ item }">
          <v-chip
            :color="getStockColor(item.stock, item.minStock)"
            size="small"
          >
            {{ item.stock }}
          </v-chip>
        </template>
        
        <template v-slot:item.purchasePrice="{ item }">
          ${{ item.purchasePrice.toFixed(2) }}
        </template>
        
        <template v-slot:item.sellingPrice="{ item }">
          ${{ item.sellingPrice.toFixed(2) }}
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="navigateToProductDetail(item.id)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          
          <v-btn
            icon
            variant="text"
            size="small"
            color="warning"
            @click="navigateToEditProduct(item.id)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Confirm Delete
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete <strong>{{ selectedProduct?.name }}</strong>? This action cannot be undone.
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
    
    <!-- Export Dialog -->
    <v-dialog v-model="exportDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Export Data
        </v-card-title>
        
        <v-card-text>
          <v-radio-group v-model="exportFormat">
            <v-radio label="Excel (.xlsx)" value="excel"></v-radio>
            <v-radio label="PDF" value="pdf"></v-radio>
          </v-radio-group>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="exportDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" variant="text" @click="downloadExport">
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '~/stores/product';
import { useAlertStore } from '~/stores/alert';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const router = useRouter();
const productStore = useProductStore();
const alertStore = useAlertStore();

const search = ref('');
const categoryFilter = ref('All Categories');
const stockFilter = ref('All');
const loading = ref(false);
const deleteDialog = ref(false);
const selectedProduct = ref(null);
const exportDialog = ref(false);
const exportFormat = ref('excel');

const stockFilterOptions = [
  'All',
  'In Stock',
  'Low Stock',
  'Out of Stock'
];

const headers = [
  { title: 'Image', key: 'imageUrl', sortable: false },
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Category', key: 'category' },
  { title: 'Expiry Date', key: 'expiryDate' },
  { title: 'Stock', key: 'stock' },
  { title: 'Purchase Price', key: 'purchasePrice' },
  { title: 'Selling Price', key: 'sellingPrice' },
  { title: 'Supplier', key: 'supplier' },
  { title: 'Location', key: 'location' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const filteredProducts = computed(() => {
  let filtered = [...productStore.products];
  
  // Apply category filter
  if (categoryFilter.value !== 'All Categories') {
    filtered = filtered.filter(product => product.category === categoryFilter.value);
  }
  
  // Apply stock filter
  if (stockFilter.value !== 'All') {
    if (stockFilter.value === 'In Stock') {
      filtered = filtered.filter(product => product.stock > product.minStock);
    } else if (stockFilter.value === 'Low Stock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= product.minStock);
    } else if (stockFilter.value === 'Out of Stock') {
      filtered = filtered.filter(product => product.stock === 0);
    }
  }
  
  return filtered;
});

function navigateToAddProduct() {
  router.push('/products/add');
}

function navigateToProductDetail(id) {
  router.push(`/products/${id}`);
}

function navigateToEditProduct(id) {
  router.push(`/products/${id}/edit`);
}

function confirmDelete(product) {
  selectedProduct.value = product;
  deleteDialog.value = true;
}

function deleteProduct() {
  if (selectedProduct.value) {
    productStore.deleteProduct(selectedProduct.value.id);
    alertStore.setAlert({
      message: `Product "${selectedProduct.value.name}" has been deleted`,
      type: 'success'
    });
    deleteDialog.value = false;
    selectedProduct.value = null;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function getExpiryColor(dateString) {
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
  if (stock === 0) {
    return 'error';
  } else if (stock <= minStock) {
    return 'warning';
  } else {
    return 'success';
  }
}

function exportData() {
  exportDialog.value = true;
}

function downloadExport() {
  if (exportFormat.value === 'excel') {
    exportToExcel();
  } else {
    exportToPdf();
  }
  exportDialog.value = false;
}

function exportToExcel() {
  const data = filteredProducts.value.map(product => ({
    Name: product.name,
    Barcode: product.barcode,
    Category: product.category,
    'Expiry Date': formatDate(product.expiryDate),
    Stock: product.stock,
    'Min Stock': product.minStock,
    'Purchase Price': `$${product.purchasePrice.toFixed(2)}`,
    'Selling Price': `$${product.sellingPrice.toFixed(2)}`,
    Supplier: product.supplier,
    Location: product.location
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  // Generate file
  XLSX.writeFile(workbook, 'food_inventory_products.xlsx');
}

function exportToPdf() {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Food Inventory Products', 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Create table
  const tableColumn = ['Name', 'Category', 'Expiry Date', 'Stock', 'Purchase Price', 'Selling Price', 'Location'];
  const tableRows = filteredProducts.value.map(product => [
    product.name,
    product.category,
    formatDate(product.expiryDate),
    product.stock.toString(),
    `$${product.purchasePrice.toFixed(2)}`,
    `$${product.sellingPrice.toFixed(2)}`,
    product.location
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 8
    },
    headStyles: {
      fillColor: [24, 103, 192]
    }
  });
  
  // Save PDF
  doc.save('food_inventory_products.pdf');
}
</script>