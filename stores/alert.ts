import { defineStore } from 'pinia';
import { useProductStore } from './product';

interface Alert {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: string;
  actionText?: string;
}

export const useAlertStore = defineStore('alert', {
  state: () => ({
    currentAlert: null as Alert | null,
    expirationAlerts: [] as any[],
    lowStockAlerts: [] as any[]
  }),
  
  actions: {
    setAlert(alert: Alert) {
      this.currentAlert = alert;
      
      // Auto-clear after 5 seconds
      setTimeout(() => {
        if (this.currentAlert === alert) {
          this.currentAlert = null;
        }
      }, 5000);
    },
    
    clearAlert() {
      this.currentAlert = null;
    },
    
    checkExpirationAlerts() {
      const productStore = useProductStore();
      const expiringProducts = productStore.getExpiringProducts;
      
      this.expirationAlerts = expiringProducts.map(product => ({
        id: product.id,
        name: product.name,
        expiryDate: product.expiryDate
      }));
      
      if (expiringProducts.length > 0) {
        this.setAlert({
          message: `${expiringProducts.length} products are expiring soon`,
          type: 'warning',
          action: 'showExpirationAlerts',
          actionText: 'View'
        });
      }
    },
    
    checkLowStockAlerts() {
      const productStore = useProductStore();
      const lowStockProducts = productStore.getLowStockProducts;
      
      this.lowStockAlerts = lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: product.minStock
      }));
      
      if (lowStockProducts.length > 0) {
        this.setAlert({
          message: `${lowStockProducts.length} products are low on stock`,
          type: 'error',
          action: 'showLowStockAlerts',
          actionText: 'View'
        });
      }
    }
  }
});