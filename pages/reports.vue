<template>
  <div>
    <h1 class="text-h4 mb-6">Reports</h1>
    
    <v-tabs v-model="activeTab" bg-color="primary" align-tabs="center">
      <v-tab value="inventory">Inventory Valuation</v-tab>
      <v-tab value="expiry">Expiry Analysis</v-tab>
      <v-tab value="lowStock">Low Stock</v-tab>
      <v-tab value="movements">Stock Movements</v-tab>
    </v-tabs>
    
    <v-card class="mt-4">
      <v-card-title>
        <v-icon start>mdi-filter-variant</v-icon>
        Report Filters
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6" v-if="activeTab === 'movements' || activeTab === 'expiry'">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="reportParams.startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="reportParams.endDate"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-select
              v-model="reportParams.categories"
              :items="productStore.categories"
              label="Categories"
              multiple
              chips
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="primary" prepend-icon="mdi-refresh" @click="generateReport">
              Generate Report
            </v-btn>
            
            <v-btn color="success" class="ml-2" prepend-icon="mdi-export" @click="exportReport">
              Export Report
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="inventory">
        <InventoryValuationReport :params="reportParams" v-if="showReport" />
      </v-window-item>
      
      <v-window-item value="expiry">
        <ExpiryAnalysisReport :params="reportParams" v-if="showReport" />
      </v-window-item>
      
      <v-window-item value="lowStock">
        <LowStockReport :params="reportParams" v-if="showReport" />
      </v-window-item>
      
      <v-window-item value="movements">
        <StockMovementReport :params="reportParams" v-if="showReport" />
      </v-window-item>
    </v-window>
    
    <!-- Export Dialog -->
    <v-dialog v-model="exportDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Export Report
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
import { ref, onMounted } from 'vue';
import { useProductStore } from '~/stores/product';
import { useAlertStore } from '~/stores/alert';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const productStore = useProductStore();
const alertStore = useAlertStore();

const activeTab = ref('inventory');
const showReport = ref(false);
const exportDialog = ref(false);
const exportFormat = ref('excel');

// Set default dates to current month
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const reportParams = ref({
  startDate: firstDayOfMonth.toISOString().substr(0, 10),
  endDate: lastDayOfMonth.toISOString().substr(0, 10),
  categories: []
});

onMounted(() => {
  generateReport();
});

function generateReport() {
  showReport.value = false;
  
  // Validate date range for reports that need it
  if (activeTab.value === 'movements' || activeTab.value === 'expiry') {
    const startDate = new Date(reportParams.value.startDate);
    const endDate = new Date(reportParams.value.endDate);
    
    if (endDate < startDate) {
      alertStore.setAlert({
        message: 'End date cannot be before start date',
        type: 'error'
      });
      return;
    }
  }
  
  // Show report after a short delay to ensure the component is re-rendered
  setTimeout(() => {
    showReport.value = true;
  }, 100);
}

function exportReport() {
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
  let data = [];
  let sheetName = '';
  
  // Generate data based on active tab
  if (activeTab.value === 'inventory') {
    sheetName = 'Inventory Valuation';
    data = productStore.products.map(product => ({
      Name: product.name,
      Category: product.category,
      Stock: product.stock,
      'Purchase Price': `$${product.purchasePrice.toFixed(2)}`,
      'Total Value': `$${(product.stock * product.purchasePrice).toFixed(2)}`
    }));
  } else if (activeTab.value === 'expiry') {
    sheetName = 'Expiry Analysis';
    
    const startDate = new Date(reportParams.value.startDate);
    const endDate = new Date(reportParams.value.endDate);
    
    data = productStore.products
      .filter(product => {
        const expiryDate = new Date(product.expiryDate);
        return expiryDate >= startDate && expiryDate <= endDate;
      })
      .map(product => {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        return {
          Name: product.name,
          Category: product.category,
          'Expiry Date': expiryDate.toLocaleDateString(),
          'Days Until Expiry': daysUntilExpiry,
          Stock: product.stock,
          'Total Value': `$${(product.stock * product.purchasePrice).toFixed(2)}`
        };
      });
  } else if (activeTab.value === 'lowStock') {
    sheetName = 'Low Stock';
    data = productStore.getLowStockProducts.map(product => {
      const reorderAmount = Math.max(0, product.minStock - product.stock);
      
      return {
        Name: product.name,
        Category: product.category,
        'Current Stock': product.stock,
        'Minimum Stock': product.minStock,
        'Reorder Amount': reorderAmount,
        'Reorder Value': `$${(reorderAmount * product.purchasePrice).toFixed(2)}`,
        Supplier: product.supplier
      };
    });
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate file
  XLSX.writeFile(workbook, `food_inventory_${activeTab.value}_report.xlsx`);
}

function exportToPdf() {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  let title = '';
  
  switch (activeTab.value) {
    case 'inventory': title = 'Inventory Valuation Report'; break;
    case 'expiry': title = 'Expiry Analysis Report'; break;
    case 'lowStock': title = 'Low Stock Report'; break;
    case 'movements': title = 'Stock Movement Report'; break;
  }
  
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Create table
  let tableColumn = [];
  let tableRows = [];
  
  if (activeTab.value === 'inventory') {
    tableColumn = ['Product', 'Category', 'Stock', 'Purchase Price', 'Total Value'];
    tableRows = productStore.products.map(product => [
      product.name,
      product.category,
      product.stock.toString(),
      `$${product.purchasePrice.toFixed(2)}`,
      `$${(product.stock * product.purchasePrice).toFixed(2)}`
    ]);
  } else if (activeTab.value === 'expiry') {
    tableColumn = ['Product', 'Category', 'Expiry Date', 'Days Until Expiry', 'Stock', 'Total Value'];
    
    const startDate = new Date(reportParams.value.startDate);
    const endDate = new Date(reportParams.value.endDate);
    const today = new Date();
    
    tableRows = productStore.products
      .filter(product => {
        const expiryDate = new Date(product.expiryDate);
        return expiryDate >= startDate && expiryDate <= endDate;
      })
      .map(product => {
        const expiryDate = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        return [
          product.name,
          product.category,
          expiryDate.toLocaleDateString(),
          daysUntilExpiry.toString(),
          product.stock.toString(),
          `$${(product.stock * product.purchasePrice).toFixed(2)}`
        ];
      });
  } else if (activeTab.value === 'lowStock') {
    tableColumn = ['Product', 'Category', 'Current Stock', 'Min Stock', 'Reorder Amount', 'Reorder Value'];
    tableRows = productStore.getLowStockProducts.map(product => {
      const reorderAmount = Math.max(0, product.minStock - product.stock);
      
      return [
        product.name,
        product.category,
        product.stock.toString(),
        product.minStock.toString(),
        reorderAmount.toString(),
        `$${(reorderAmount * product.purchasePrice).toFixed(2)}`
      ];
    });
  }
  
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
  doc.save(`food_inventory_${activeTab.value}_report.pdf`);
}
</script>