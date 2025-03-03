import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'initial' | 'addition' | 'reduction' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  notes: string;
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    movements: [] as InventoryMovement[]
  }),
  
  getters: {
    getMovementsByProductId: (state) => (productId: string) => {
      return state.movements.filter(movement => movement.productId === productId);
    },
    
    getRecentMovements: (state) => (limit: number = 10) => {
      return [...state.movements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    },
    
    getMovementsByDateRange: (state) => (startDate: string, endDate: string) => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      
      return state.movements.filter(movement => {
        const movementDate = new Date(movement.date).getTime();
        return movementDate >= start && movementDate <= end;
      });
    },
    
    getMovementsByType: (state) => (type: InventoryMovement['type']) => {
      return state.movements.filter(movement => movement.type === type);
    },
    
    getTotalMovementsByType: (state) => {
      const totals: Record<InventoryMovement['type'], number> = {
        initial: 0,
        addition: 0,
        reduction: 0,
        adjustment: 0
      };
      
      state.movements.forEach(movement => {
        totals[movement.type] += movement.quantity;
      });
      
      return totals;
    }
  },
  
  actions: {
    addMovement(movement: Omit<InventoryMovement, 'id'>) {
      const newMovement: InventoryMovement = {
        id: uuidv4(),
        ...movement
      };
      
      this.movements.push(newMovement);
      this.saveMovements();
      
      return newMovement;
    },
    
    deleteMovement(id: string) {
      const index = this.movements.findIndex(m => m.id === id);
      
      if (index !== -1) {
        this.movements.splice(index, 1);
        this.saveMovements();
        return true;
      }
      
      return false;
    },
    
    saveMovements() {
      if (process.client) {
        localStorage.setItem('food-inventory-movements', JSON.stringify(this.movements));
      }
    },
    
    loadMovements() {
      if (process.client) {
        const savedMovements = localStorage.getItem('food-inventory-movements');
        if (savedMovements) {
          this.movements = JSON.parse(savedMovements);
        }
      }
    }
  }
});