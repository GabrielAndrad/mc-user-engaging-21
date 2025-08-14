import { Subscription, Observable } from 'rxjs';
import { integrateWithManagedStores } from './advanced-performance-monitor';

/**
 * 📊 INTERFACE: Managed subscription
 */
interface ManagedSubscription {
  id: string;
  subscription: Subscription;
  createdAt: number;
  storeName: string;
  type: string;
  active: boolean;
}

/**
 * 🏪 MANAGED SUBSCRIPTION STORE
 */
class ManagedSubscriptionStore {
  private storeName: string;
  private subscriptions = new Map<string, ManagedSubscription>();
  private performanceTracker = integrateWithManagedStores();
  private createdCount = 0;
  private memoryWarningThreshold = 15; // Alerta quando > 15 subscriptions ativas
  private memoryLeakThreshold = 25; // Possível memory leak quando > 25 subscriptions ativas

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  createManagedSubscription<T>(
    observable: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): string {
    const id = `${this.storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.createdCount++;
    
    const subscription = observable.subscribe(
      next, 
      (err) => {
        setTimeout(() => {
          this.cleanup(id);
        }, 100);
        if (error) error(err);
      },
      () => {
        setTimeout(() => {
          this.cleanup(id);
        }, 100);
        if (complete) complete();
      }
    );
    
    const managedSub: ManagedSubscription = {
      id,
      subscription,
      createdAt: Date.now(),
      storeName: this.storeName,
      type: 'rxjs-subscription',
      active: true
    };

    this.subscriptions.set(id, managedSub);
    this.performanceTracker.trackSubscription(this.storeName, id, 'rxjs-subscription');
    
    // 🚨 MEMORY WARNING: Log apenas quando há risco de memory leak
    const activeCount = this.getActiveSubscriptionsCount();
    if (activeCount >= this.memoryLeakThreshold) {
      // console.error(`🔴 MEMORY LEAK DETECTED [${this.storeName}]: ${activeCount} subscriptions ativas! Possível vazamento de memória.`);
    } else if (activeCount >= this.memoryWarningThreshold) {
      // console.warn(`🟡 HIGH MEMORY USAGE [${this.storeName}]: ${activeCount} subscriptions ativas (limite recomendado: ${this.memoryWarningThreshold})`);
    }
    
    return id;
  }

  cleanup(subscriptionId: string): boolean {
    const managedSub = this.subscriptions.get(subscriptionId);
    
    if (managedSub && managedSub.active) {
      if (!managedSub.subscription.closed) {
        managedSub.subscription.unsubscribe();
      }
      managedSub.active = false;
      this.subscriptions.delete(subscriptionId);
      this.performanceTracker.trackCleanup(this.storeName, subscriptionId);
      return true;
    }
    
    return false;
  }

  cleanupAll(): number {
    let cleaned = 0;
    
    this.subscriptions.forEach((managedSub, id) => {
      if (managedSub.active) {
        if (!managedSub.subscription.closed) {
          managedSub.subscription.unsubscribe();
        }
        managedSub.active = false;
        cleaned++;
      }
    });
    
    this.subscriptions.clear();
    
    // 🧹 Log apenas limpezas significativas de memória
    if (cleaned >= 5) {
      console.log(`🧹 MEMORY CLEANUP [${this.storeName}]: ${cleaned} subscriptions limpas`);
    }
    return cleaned;
  }

  private getActiveSubscriptionsCount(): number {
    return Array.from(this.subscriptions.values()).filter(s => s.active).length;
  }

  getStats(): {
    storeName: string;
    activeSubscriptions: number;
    totalCreated: number;
    oldestSubscription: number | null;
  } {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(s => s.active);
    const oldestActive = activeSubscriptions.length > 0 
      ? Math.min(...activeSubscriptions.map(s => s.createdAt))
      : null;

    return {
      storeName: this.storeName,
      activeSubscriptions: activeSubscriptions.length,
      totalCreated: this.createdCount,
      oldestSubscription: oldestActive
    };
  }
}

/**
 * 🌍 GLOBAL STORE REGISTRY
 */
class GlobalStoreRegistry {
  private static instance: GlobalStoreRegistry;
  private stores = new Map<string, ManagedSubscriptionStore>();

  static getInstance(): GlobalStoreRegistry {
    if (!GlobalStoreRegistry.instance) {
      GlobalStoreRegistry.instance = new GlobalStoreRegistry();
    }
    return GlobalStoreRegistry.instance;
  }

  registerStore(storeName: string): ManagedSubscriptionStore {
    if (!this.stores.has(storeName)) {
      const store = new ManagedSubscriptionStore(storeName);
      this.stores.set(storeName, store);
    }
    return this.stores.get(storeName)!;
  }

  getStore(storeName: string): ManagedSubscriptionStore | undefined {
    return this.stores.get(storeName);
  }

  getAllStores(): Map<string, ManagedSubscriptionStore> {
    return this.stores;
  }

  globalCleanup(): number {
    let totalCleaned = 0;
    this.stores.forEach(store => {
      totalCleaned += store.cleanupAll();
    });
    
    // 🌍 Log apenas limpezas globais significativas
    if (totalCleaned >= 10) {
      console.log(`🌍 GLOBAL MEMORY CLEANUP: ${totalCleaned} subscriptions removidas`);
    }
    return totalCleaned;
  }

  getGlobalStats(): {
    totalStores: number;
    totalActiveSubscriptions: number;
    storeDetails: any[];
  } {
    const storeDetails: any[] = [];
    let totalActiveSubscriptions = 0;

    this.stores.forEach(store => {
      const stats = store.getStats();
      storeDetails.push(stats);
      totalActiveSubscriptions += stats.activeSubscriptions;
    });

    return {
      totalStores: this.stores.size,
      totalActiveSubscriptions,
      storeDetails
    };
  }

  // 📊 Log apenas stores com problemas de memória
  logSummary(): void {
    const stats = this.getGlobalStats();
    
    // 🚨 Alerta se há muitas subscriptions ativas globalmente
    if (stats.totalActiveSubscriptions > 50) {
      console.error(`🔴 GLOBAL MEMORY LEAK: ${stats.totalActiveSubscriptions} subscriptions ativas em ${stats.totalStores} stores!`);
      
      // Mostrar apenas stores problemáticos
      const problematicStores = stats.storeDetails.filter(store => store.activeSubscriptions > 10);
      if (problematicStores.length > 0) {
        console.table(problematicStores.map(store => ({
          'Store': store.storeName,
          'Subscriptions Ativas': store.activeSubscriptions,
          'Tempo da Mais Antiga (min)': store.oldestSubscription 
            ? Math.round((Date.now() - store.oldestSubscription) / 60000) 
            : 'N/A'
        })));
      }
    } else if (stats.totalActiveSubscriptions > 30) {
      console.warn(`🟡 HIGH GLOBAL MEMORY USAGE: ${stats.totalActiveSubscriptions} subscriptions ativas`);
    }
  }
}

// ===================================================
// 🛠️ FACTORY FUNCTIONS
// ===================================================

const globalRegistry = GlobalStoreRegistry.getInstance();

/**
 * Cria e registra uma managed store
 */
export const createAndRegisterManagedStore = (storeName: string) => {
  const store = globalRegistry.registerStore(storeName);
  
  return {
    createManagedSubscription: <T>(
      observable: Observable<T>,
      next?: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void
    ) => store.createManagedSubscription(observable, next, error, complete),
    
    cleanupStoreSubscriptions: () => store.cleanupAll(),
    
    getStoreStats: () => store.getStats()
  };
};

// ===================================================
// 🌍 GLOBAL FUNCTIONS
// ===================================================

export const getGlobalStoreStats = () => globalRegistry.getGlobalStats();
export const globalStoreCleanup = () => globalRegistry.globalCleanup();
export const getAllManagedStores = () => globalRegistry.getAllStores();

// Exposição global para debug
(window as any).getGlobalStoreStats = getGlobalStoreStats;
(window as any).globalStoreCleanup = globalStoreCleanup;
(window as any).getAllManagedStores = getAllManagedStores;

// 📊 DEBUGGING: Log resumido apenas para problemas de memória
export const logSystemSummary = () => globalRegistry.logSummary();

// 🔍 DEBUGGING: Log detalhado para análise de memory leaks
export const logDetailedStats = () => {
  const stats = getGlobalStoreStats();
  const problematicStores = stats.storeDetails.filter(store => store.activeSubscriptions > 5);
  
  if (problematicStores.length > 0) {
    console.log('🔍 DETAILED MEMORY ANALYSIS:');
    console.table(problematicStores.map(store => ({
      'Store': store.storeName,
      'Subscriptions Ativas': store.activeSubscriptions,
      'Total Criadas': store.totalCreated,
      'Tempo da Mais Antiga (min)': store.oldestSubscription 
        ? Math.round((Date.now() - store.oldestSubscription) / 60000) 
        : 'N/A',
      'Taxa de Limpeza': `${((store.totalCreated - store.activeSubscriptions) / store.totalCreated * 100).toFixed(1)}%`
    })));
  } else {
    console.log('✅ MEMORY STATUS: Todas as stores estão com uso normal de memória');
  }
};
