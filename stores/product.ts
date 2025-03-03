import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useInventoryStore } from './inventory';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  expiryDate: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    categories: ['Dairy', 'Meat', 'Produce', 'Bakery', 'Beverages', 'Frozen', 'Canned', 'Dry Goods', 'Snacks', 'Other'],
    suppliers: ['Farm Fresh', 'Global Foods', 'Organic Valley', 'Metro Distributors', 'Quality Foods', 'Local Farms'],
    locations: ['Shelf A1', 'Shelf A2', 'Shelf B1', 'Shelf B2', 'Freezer 1', 'Freezer 2', 'Cold Storage', 'Dry Storage']
  }),
  
  getters: {
    getProductById: (state) => (id: string) => {
      return state.products.find(product => product.id === id);
    },
    
    getExpiringProducts: (state) => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      return state.products.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        return expiryDate > today && expiryDate <= thirtyDaysFromNow;
      });
    },
    
    getLowStockProducts: (state) => {
      return state.products.filter(product => product.stock <= product.minStock);
    },
    
    getProductsByCategory: (state) => (category: string) => {
      return state.products.filter(product => product.category === category);
    },
    
    getTotalInventoryValue: (state) => {
      return state.products.reduce((total, product) => {
        return total + (product.purchasePrice * product.stock);
      }, 0);
    },
    
    getTotalInventoryCount: (state) => {
      return state.products.reduce((total, product) => {
        return total + product.stock;
      }, 0);
    },
    
    getCategoryDistribution: (state) => {
      const distribution: Record<string, number> = {};
      
      state.categories.forEach(category => {
        distribution[category] = state.products.filter(p => p.category === category).length;
      });
      
      return distribution;
    }
  },
  
  actions: {
    addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
      const inventoryStore = useInventoryStore();
      const now = new Date().toISOString();
      
      const newProduct: Product = {
        id: uuidv4(),
        ...product,
        createdAt: now,
        updatedAt: now
      };
      
      this.products.push(newProduct);
      this.saveProducts();
      
      // Add to inventory movement history
      inventoryStore.addMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'initial',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        date: now,
        notes: 'Initial stock'
      });
      
      return newProduct;
    },
    
    updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
      const inventoryStore = useInventoryStore();
      const index = this.products.findIndex(p => p.id === id);
      
      if (index !== -1) {
        const oldProduct = { ...this.products[index] };
        const now = new Date().toISOString();
        
        this.products[index] = {
          ...oldProduct,
          ...updates,
          updatedAt: now
        };
        
        this.saveProducts();
        
        // If stock was updated, add to inventory movement history
        if (updates.stock !== undefined && updates.stock !== oldProduct.stock) {
          const difference = updates.stock - oldProduct.stock;
          
          inventoryStore.addMovement({
            productId: id,
            productName: this.products[index].name,
            type: difference > 0 ? 'addition' : 'reduction',
            quantity: Math.abs(difference),
            previousStock: oldProduct.stock,
            newStock: updates.stock,
            date: now,
            notes: 'Stock update'
          });
        }
        
        return this.products[index];
      }
      
      return null;
    },
    
    deleteProduct(id: string) {
      const index = this.products.findIndex(p => p.id === id);
      
      if (index !== -1) {
        this.products.splice(index, 1);
        this.saveProducts();
        return true;
      }
      
      return false;
    },
    
    adjustStock(id: string, quantity: number, type: 'addition' | 'reduction', notes: string = '') {
      const inventoryStore = useInventoryStore();
      const product = this.getProductById(id);
      
      if (!product) return null;
      
      const previousStock = product.stock;
      let newStock = previousStock;
      
      if (type === 'addition') {
        newStock += quantity;
      } else {
        newStock = Math.max(0, previousStock - quantity);
      }
      
      // Update the product
      this.updateProduct(id, { stock: newStock });
      
      // Add to inventory movement history
      inventoryStore.addMovement({
        productId: id,
        productName: product.name,
        type,
        quantity,
        previousStock,
        newStock,
        date: new Date().toISOString(),
        notes
      });
      
      return { previousStock, newStock };
    },
    
    saveProducts() {
      if (process.client) {
        localStorage.setItem('food-inventory-products', JSON.stringify(this.products));
      }
    },
    
    loadProducts() {
      if (process.client) {
        const savedProducts = localStorage.getItem('food-inventory-products');
        if (savedProducts) {
          this.products = JSON.parse(savedProducts);
        }
      }
    }
  }
});