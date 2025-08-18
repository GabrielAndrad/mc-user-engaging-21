// ===================================================
// 🔬 ADVANCED PERFORMANCE MONITOR - PMC WEB V2
// Sistema de monitoramento integrado com as 4 camadas de gerenciamento de memória
// ===================================================

import * as React from 'react';

/**
 * 📊 INTERFACES: Tipos de métricas expandidas
 */
interface StoreMetrics {
  storeName: string;
  activeSubscriptions: number;
  totalSubscriptionsCreated: number;
  totalSubscriptionsCleaned: number;
  memoryLeakScore: number; // 0-100 (0 = sem vazamentos, 100 = crítico)
  lastActivity: number;
  averageLifetime: number;
  subscriptionDetails: SubscriptionDetail[];
}

interface SubscriptionDetail {
  id: string;
  createdAt: number;
  lifetime: number;
  type: string;
  status: 'active' | 'cleaned' | 'leaked';
}

interface ComponentMetrics {
  componentName: string;
  mountCount: number;
  unmountCount: number;
  renderCount: number;
  avgRenderTime: number;
  memoryUsage: number;
  resourceLeaks: ResourceLeak[];
  lastSeen: number;
}

interface ResourceLeak {
  type: 'subscription' | 'interval' | 'timeout' | 'eventListener' | 'observer' | 'websocket' | 'worker' | 'mediaStream';
  id: string;
  createdAt: number;
  lifetime: number;
  componentName?: string;
  details: any;
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  storeMemoryUsage?: Record<string, number>;
  componentMemoryUsage?: Record<string, number>;
  resourceCount?: Record<string, number>;
}

/**
 * 🏭 ADVANCED PERFORMANCE MONITOR
 */
class AdvancedPerformanceMonitor {
  private static instance: AdvancedPerformanceMonitor;
  
  // Métricas
  private storeMetrics = new Map<string, StoreMetrics>();
  private componentMetrics = new Map<string, ComponentMetrics>();
  private memorySnapshots: MemorySnapshot[] = [];
  private resourceLeaks: ResourceLeak[] = [];
  
  // Tracking
  private subscriptionTracker = new Map<string, SubscriptionDetail>();
  private componentTracker = new Map<string, { mountTime: number; renderTimes: number[] }>();
  
  // Estado interno
  private startTime: number = Date.now();
  
  // Configurações
  private config = {
    maxSnapshots: 100,
    snapshotInterval: 5000, // 5 segundos
    leakThreshold: 30000, // 30 segundos
    criticalMemoryThreshold: 500 * 1024 * 1024, // 500MB
    enableAutoReporting: true
  };

  static getInstance(): AdvancedPerformanceMonitor {
    if (!AdvancedPerformanceMonitor.instance) {
      AdvancedPerformanceMonitor.instance = new AdvancedPerformanceMonitor();
    }
    return AdvancedPerformanceMonitor.instance;
  }

  constructor() {
    this.startMonitoring();
    this.exposeDebugCommands();
  }

  /**
   * 🏪 STORE MONITORING: Integração com ManagedSubscriptionStore
   */
  trackStoreSubscription(storeName: string, subscriptionId: string, type: string): void {
    // Atualizar métricas da store
    let storeMetric = this.storeMetrics.get(storeName);
    if (!storeMetric) {
      storeMetric = {
        storeName,
        activeSubscriptions: 0,
        totalSubscriptionsCreated: 0,
        totalSubscriptionsCleaned: 0,
        memoryLeakScore: 0,
        lastActivity: Date.now(),
        averageLifetime: 0,
        subscriptionDetails: []
      };
      this.storeMetrics.set(storeName, storeMetric);
    }

    // Tracking detalhado da subscription
    const subscriptionDetail: SubscriptionDetail = {
      id: subscriptionId,
      createdAt: Date.now(),
      lifetime: 0,
      type,
      status: 'active'
    };

    storeMetric.activeSubscriptions++;
    storeMetric.totalSubscriptionsCreated++;
    storeMetric.lastActivity = Date.now();
    storeMetric.subscriptionDetails.push(subscriptionDetail);
    
    this.subscriptionTracker.set(subscriptionId, subscriptionDetail);
  }

  trackStoreCleanup(storeName: string, subscriptionId: string): void {
    const storeMetric = this.storeMetrics.get(storeName);
    const subscriptionDetail = this.subscriptionTracker.get(subscriptionId);

    if (storeMetric && subscriptionDetail) {
      storeMetric.activeSubscriptions = Math.max(0, storeMetric.activeSubscriptions - 1);
      storeMetric.totalSubscriptionsCleaned++;
      storeMetric.lastActivity = Date.now();

      subscriptionDetail.lifetime = Date.now() - subscriptionDetail.createdAt;
      subscriptionDetail.status = 'cleaned';

      // Calcular tempo médio de vida
      const cleanedSubscriptions = storeMetric.subscriptionDetails.filter(s => s.status === 'cleaned');
      if (cleanedSubscriptions.length > 0) {
        storeMetric.averageLifetime = cleanedSubscriptions.reduce((acc, s) => acc + s.lifetime, 0) / cleanedSubscriptions.length;
      }

      this.subscriptionTracker.delete(subscriptionId);
    }
  }

  /**
   * 🧩 COMPONENT MONITORING: Integração com ReactLifecycleCleanup
   */
  trackComponentMount(componentName: string): void {
    let componentMetric = this.componentMetrics.get(componentName);
    if (!componentMetric) {
      componentMetric = {
        componentName,
        mountCount: 0,
        unmountCount: 0,
        renderCount: 0,
        avgRenderTime: 0,
        memoryUsage: 0,
        resourceLeaks: [],
        lastSeen: Date.now()
      };
      this.componentMetrics.set(componentName, componentMetric);
    }

    componentMetric.mountCount++;
    componentMetric.lastSeen = Date.now();
    
    this.componentTracker.set(componentName, {
      mountTime: Date.now(),
      renderTimes: []
    });
  }

  trackComponentUnmount(componentName: string): void {
    const componentMetric = this.componentMetrics.get(componentName);
    if (componentMetric) {
      componentMetric.unmountCount++;
      componentMetric.lastSeen = Date.now();
    }

    this.componentTracker.delete(componentName);
  }

  trackComponentRender(componentName: string, renderTime?: number): void {
    const componentMetric = this.componentMetrics.get(componentName);
    const tracker = this.componentTracker.get(componentName);

    if (componentMetric && tracker) {
      componentMetric.renderCount++;
      componentMetric.lastSeen = Date.now();

      if (renderTime) {
        tracker.renderTimes.push(renderTime);
        componentMetric.avgRenderTime = tracker.renderTimes.reduce((a, b) => a + b, 0) / tracker.renderTimes.length;
      }
    }
  }

  /**
   * 🔧 RESOURCE MONITORING: Integração com AdvancedCleanupManager
   */
  trackResourceLeak(type: ResourceLeak['type'], id: string, componentName?: string, details?: any): void {
    const leak: ResourceLeak = {
      type,
      id,
      createdAt: Date.now(),
      lifetime: 0,
      componentName,
      details
    };

    this.resourceLeaks.push(leak);
    
    // Adicionar à métrica do componente se existir
    if (componentName) {
      const componentMetric = this.componentMetrics.get(componentName);
      if (componentMetric) {
        componentMetric.resourceLeaks.push(leak);
      }
    }

    // Silent leak detection - only log in debug mode manually enabled
    // Removed automatic console.warn for production
  }

  /**
   * 💾 MEMORY MONITORING: Sistema avançado de memória
   */
  private calculateInternalMemoryUsage(): number {
    let estimatedBytes = 0;
    
    // Array de snapshots
    estimatedBytes += this.memorySnapshots.length * 500; // ~500 bytes por snapshot estimado
    
    // Array de resource leaks
    estimatedBytes += this.resourceLeaks.length * 300; // ~300 bytes por leak estimado
    
    // Maps de métricas
    this.storeMetrics.forEach(metrics => {
      estimatedBytes += 200; // overhead do map entry
      estimatedBytes += metrics.subscriptionDetails.length * 150; // ~150 bytes por subscription detail
    });
    
    this.componentMetrics.forEach(metrics => {
      estimatedBytes += 200; // overhead do map entry
      estimatedBytes += metrics.resourceLeaks.length * 300; // ~300 bytes por resource leak
    });
    
    // Trackers
    estimatedBytes += this.subscriptionTracker.size * 200; // ~200 bytes por tracker
    estimatedBytes += this.componentTracker.size * 100; // ~100 bytes por component tracker
    
    return estimatedBytes;
  }

  private takeMemorySnapshot(): void {
    if (!(performance as any).memory) return;

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      storeMemoryUsage: {},
      componentMemoryUsage: {},
      resourceCount: {}
    };

    this.memorySnapshots.push(snapshot);

    // Limitar snapshots para evitar vazamento do próprio monitor
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots = this.memorySnapshots.slice(-50);
    }

    const usedMB = snapshot.usedJSHeapSize / 1024 / 1024;
    const totalMB = snapshot.totalJSHeapSize / 1024 / 1024;
    const limitMB = snapshot.jsHeapSizeLimit / 1024 / 1024;

    // Silent monitoring - removed automatic console.logs for production
    // Only manual debug commands will show logs

    // Check for critical memory usage (above 80% of limit) - silent check
    if (usedMB > limitMB * 0.8) {
      // Silent warning - no automatic console.error
    }

    // Detect anomalous growth (>100MB in short time) - silent detection  
    if (this.memorySnapshots.length >= 3) {
      const previous = this.memorySnapshots[this.memorySnapshots.length - 3];
      const growthMB = (snapshot.usedJSHeapSize - previous.usedJSHeapSize) / 1024 / 1024;
      
      if (growthMB > 100) {
        // Silent warning - no automatic console.warn
        // Store growth detection removed temporarily
      }
    }
  }

  /**
   * 🕵️ LEAK DETECTION: Algoritmos avançados de detecção
   */
  private detectMemoryLeaks(): void {
    // Silent detection - removed automatic console.logs
    // Only manual debug commands will show these logs

    // Auto-cleanup para evitar que o próprio monitor vaze
    if (this.memorySnapshots.length > 100) {
      const removed = this.memorySnapshots.splice(0, this.memorySnapshots.length - 50);
      // Silent cleanup - no automatic console.log
    }

    if (this.resourceLeaks.length > 100) {
      const removed = this.resourceLeaks.splice(0, this.resourceLeaks.length - 50);
      // Silent cleanup - no automatic console.log  
    }

    // Limpar subscriptions muito antigas (mais de 1 hora)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let cleanedTrackers = 0;
    
    this.subscriptionTracker.forEach((tracker, key) => {
      if (tracker.createdAt < oneHourAgo && tracker.status !== 'active') {
        this.subscriptionTracker.delete(key);
        cleanedTrackers++;
      }
    });

    // Silent cleanup - no automatic console.log
  }

  /**
   * 📋 REPORTING: Relatórios detalhados
   */
  generateComprehensiveReport(): {
    timestamp: number;
    summary: any;
    stores: StoreMetrics[];
    components: ComponentMetrics[];
    memoryTrend: MemorySnapshot[];
    leaks: ResourceLeak[];
    recommendations: string[];
  } {
    const now = Date.now();
    const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];

    // Cálculos de resumo
    const totalActiveSubscriptions = Array.from(this.storeMetrics.values())
      .reduce((sum, metric) => sum + metric.activeSubscriptions, 0);
    
    const totalActiveComponents = Array.from(this.componentMetrics.values())
      .reduce((sum, metric) => sum + (metric.mountCount - metric.unmountCount), 0);

    const criticalLeaks = this.resourceLeaks.filter(leak => 
      (now - leak.createdAt) > this.config.leakThreshold
    );

    // Stores com problemas
    const problematicStores = Array.from(this.storeMetrics.values())
      .filter(metric => metric.memoryLeakScore > 50)
      .sort((a, b) => b.memoryLeakScore - a.memoryLeakScore);

    // Componentes com problemas
    const problematicComponents = Array.from(this.componentMetrics.values())
      .filter(metric => (metric.mountCount - metric.unmountCount) > 2)
      .sort((a, b) => (b.mountCount - b.unmountCount) - (a.mountCount - a.unmountCount));

    // Recomendações
    const recommendations: string[] = [];
    
    if (totalActiveSubscriptions > 50) {
      recommendations.push(`🔴 CRÍTICO: ${totalActiveSubscriptions} subscriptions ativas. Revisar lógica de cleanup.`);
    }
    
    if (problematicStores.length > 0) {
      recommendations.push(`⚠️ Stores com vazamentos: ${problematicStores.map(s => s.storeName).join(', ')}`);
    }
    
    if (problematicComponents.length > 0) {
      recommendations.push(`🧩 Componentes sem cleanup: ${problematicComponents.map(c => c.componentName).join(', ')}`);
    }

    if (lastSnapshot && lastSnapshot.usedJSHeapSize > this.config.criticalMemoryThreshold) {
      recommendations.push(`💾 MEMÓRIA CRÍTICA: ${(lastSnapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB em uso`);
    }

    if (criticalLeaks.length > 0) {
      recommendations.push(`💧 ${criticalLeaks.length} vazamentos críticos detectados`);
    }

    return {
      timestamp: now,
      summary: {
        totalActiveSubscriptions,
        totalActiveComponents,
        totalLeaks: this.resourceLeaks.length,
        criticalLeaks: criticalLeaks.length,
        memoryUsage: lastSnapshot ? `${(lastSnapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        problematicStores: problematicStores.length,
        problematicComponents: problematicComponents.length
      },
      stores: Array.from(this.storeMetrics.values()),
      components: Array.from(this.componentMetrics.values()),
      memoryTrend: this.memorySnapshots.slice(-20), // Últimos 20 snapshots
      leaks: this.resourceLeaks,
      recommendations
    };
  }

  /**
   * Função helper para formatar tempo de execução
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * 🖨️ CONSOLE REPORTING: Relatórios formatados no console
   */
  printDetailedReport(): void {
    const report = this.generateComprehensiveReport();
    
    console.group('🔬 RELATÓRIO DETALHADO DE PERFORMANCE E VAZAMENTOS');
    console.log('📊 Timestamp:', new Date(report.timestamp).toLocaleString());
    console.log('⏰ Tempo de execução:', this.formatUptime(Date.now() - this.startTime));
    
    // Seção de Memória
    console.group('💾 ANÁLISE DE MEMÓRIA');
    const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
    if (lastSnapshot) {
      console.table({
        'Uso Atual': `${(lastSnapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Limite Heap': `${(lastSnapshot.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        'Uso %': `${((lastSnapshot.usedJSHeapSize / lastSnapshot.jsHeapSizeLimit) * 100).toFixed(1)}%`
      });
    }
    console.groupEnd();
    
    // Seção de Componentes
    const problematicComponents = report.components.filter(comp => 
      (comp.mountCount - comp.unmountCount) > 0 || comp.resourceLeaks.length > 0
    );
    
    if (problematicComponents.length > 0) {
      console.group('⚠️ COMPONENTES PROBLEMÁTICOS');
      console.table(problematicComponents.map(comp => ({
        'Componente': comp.componentName,
        'Renders': comp.renderCount,
        'Tempo Médio': `${comp.avgRenderTime.toFixed(2)}ms`,
        'Memória': `${(comp.memoryUsage / 1024).toFixed(1)}KB`,
        'Órfãos': (comp.mountCount - comp.unmountCount) > 0 ? 'SIM' : 'NÃO'
      })));
      console.groupEnd();
    }
    
    // Seção de Stores RxJS
    const problematicStores = report.stores.filter(store => 
      store.activeSubscriptions > 5 || store.memoryLeakScore > 30
    );
    
    if (problematicStores.length > 0) {
      console.group('🏪 STORES COM VAZAMENTOS');
      console.table(problematicStores.map(store => ({
        'Store': store.storeName,
        'Subscriptions Ativas': store.activeSubscriptions,
        'Taxa Cleanup': store.totalSubscriptionsCreated > 0 
          ? `${((store.totalSubscriptionsCleaned / store.totalSubscriptionsCreated) * 100).toFixed(1)}%` 
          : '0%',
        'Tempo Médio Vida': `${(store.averageLifetime / 1000).toFixed(1)}s`,
        'Score Vazamento': `${store.memoryLeakScore.toFixed(1)}%`
      })));
      console.groupEnd();
    }
    
  }

  /**
   * 🎛️ CONTROL METHODS: Controles do monitor
   */
  private startMonitoring(): void {
    // Snapshot de memória periódico - silencioso
    setInterval(() => {
      this.takeMemorySnapshot();
    }, this.config.snapshotInterval);

    // Detecção de vazamentos - silenciosa
    setInterval(() => {
      this.detectMemoryLeaks();
    }, 30000); // A cada 30 segundos

    // Limpeza de dados antigos - silenciosa
    setInterval(() => {
      this.cleanupOldData();
    }, 300000); // A cada 5 minutos
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    // Limpar vazamentos antigos
    this.resourceLeaks = this.resourceLeaks.filter(leak => 
      (now - leak.createdAt) < maxAge
    );

    // Limpar detalhes de subscriptions antigas
    this.storeMetrics.forEach(metric => {
      metric.subscriptionDetails = metric.subscriptionDetails.filter(sub =>
        sub.status === 'active' || (now - sub.createdAt) < maxAge
      );
    });
  }

  reset(): void {
    this.storeMetrics.clear();
    this.componentMetrics.clear();
    this.memorySnapshots = [];
    this.resourceLeaks = [];
    this.subscriptionTracker.clear();
    this.componentTracker.clear();
  }

  /**
   * 🔓 PUBLIC GETTERS: Métodos públicos para acessar dados privados
   */
  getMemorySnapshots(): MemorySnapshot[] {
    return [...this.memorySnapshots];
  }

  getStoreMetrics(): Map<string, StoreMetrics> {
    return new Map(this.storeMetrics);
  }

  getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  getResourceLeaks(): ResourceLeak[] {
    return [...this.resourceLeaks];
  }

  /**
   * 🎮 COMANDOS INTERATIVOS PARA DEBUG - MANUAL APENAS
   */
  exposeDebugCommands(): void {
    // Expor métodos para debug global
    (window as any).performanceMonitor = {
      // Relatórios
      printDetailedReport: () => this.printDetailedReport(),
      generateLeakAnalysis: () => this.generateLeakAnalysis(),
      getComprehensiveReport: () => this.generateComprehensiveReport(),
      
      // Métricas específicas
      getStoreStats: () => Array.from(this.storeMetrics.entries()),
      getComponentStats: () => Array.from(this.componentMetrics.entries()),
      getMemorySnapshots: () => this.memorySnapshots.slice(-10),
      getResourceLeaks: () => this.resourceLeaks,
      
      // Análises direcionadas
      analyzeStore: (storeName: string) => {
        const metrics = this.storeMetrics.get(storeName);
        if (metrics) {
          console.group(`🔍 ANÁLISE ESPECÍFICA - STORE: ${storeName}`);
          console.table(metrics);
          console.groupEnd();
        } else {
          console.warn(`Store "${storeName}" não encontrada. Stores disponíveis:`, 
                      Array.from(this.storeMetrics.keys()));
        }
      },
      
      analyzeComponent: (componentName: string) => {
        const metrics = this.componentMetrics.get(componentName);
        if (metrics) {
          console.group(`🔍 ANÁLISE ESPECÍFICA - COMPONENT: ${componentName}`);
          console.table(metrics);
          console.groupEnd();
        } else {
          console.warn(`Componente "${componentName}" não encontrado. Componentes disponíveis:`, 
                      Array.from(this.componentMetrics.keys()));
        }
      },
      
      // Controles
      reset: () => this.reset(),
      forceCleanup: () => this.cleanupOldData(),
      
      // Helper para encontrar vazamentos ativos
      findActiveLeaks: () => {
        const now = Date.now();
        const activeLeaks = this.resourceLeaks.filter(leak => 
          (now - leak.createdAt) > 30000
        );
        console.table(activeLeaks.map(leak => ({
          Tipo: leak.type,
          Componente: leak.componentName || 'N/A',
          'Idade (s)': Math.floor((now - leak.createdAt) / 1000),
          ID: leak.id.substring(0, 30) + '...'
        })));
        return activeLeaks;
      }
    };

  }

  /**
   * 🔬 ANÁLISE AVANÇADA DE VAZAMENTOS - COMANDO MANUAL
   */
  generateLeakAnalysis(): void {
    console.group('🔬 PMC WEB V2 - ANÁLISE AVANÇADA DE VAZAMENTOS');
    
    const now = Date.now();
    const report = this.generateComprehensiveReport();
    
    // Análise de stores críticas
    const criticalStores = Array.from(this.storeMetrics.values())
      .filter(store => store.memoryLeakScore > 50)
      .sort((a, b) => b.memoryLeakScore - a.memoryLeakScore);
    
    if (criticalStores.length > 0) {
      console.group('🏪 ANÁLISE DETALHADA - STORES CRÍTICAS');
      criticalStores.forEach(store => {
        console.group(`📦 STORE: ${store.storeName} (Score: ${store.memoryLeakScore.toFixed(1)}%)`);
        
        // Subscription patterns
        const activeOldSubs = store.subscriptionDetails.filter(sub => 
          sub.status === 'active' && (now - sub.createdAt) > 60000
        );
        
       
        if (activeOldSubs.length > 0) {
          console.table(activeOldSubs.slice(0, 5).map(sub => ({
            ID: sub.id.substring(0, 15) + '...',
            Tipo: sub.type,
            'Idade (s)': Math.floor((now - sub.createdAt) / 1000),
            Status: sub.status
          })));
        }
        
        console.groupEnd();
      });
      console.groupEnd();
    }
    
    // Análise de componentes órfãos
    const orphanComponents = Array.from(this.componentMetrics.values())
      .filter(comp => (comp.mountCount - comp.unmountCount) > 2)
      .sort((a, b) => (b.mountCount - b.unmountCount) - (a.mountCount - a.unmountCount));
    
    if (orphanComponents.length > 0) {
      console.group('🧩 ANÁLISE DETALHADA - COMPONENTES ÓRFÃOS');
      orphanComponents.forEach(comp => {
        const orphanCount = comp.mountCount - comp.unmountCount;
        console.group(`🔧 COMPONENT: ${comp.componentName} (${orphanCount} órfãos)`);
        
        // console.log(`🎭 Montagens: ${comp.mountCount}`);
        // console.log(`💀 Desmontagens: ${comp.unmountCount}`);
        // console.log(`👻 Instâncias órfãs: ${orphanCount}`);
        // console.log(`🎨 Total renders: ${comp.renderCount}`);
        // console.log(`⚡ Tempo médio render: ${comp.avgRenderTime.toFixed(2)}ms`);
        // console.log(`💾 Uso memória: ${(comp.memoryUsage / 1024).toFixed(2)}KB`);
        // console.log(`🔧 Vazamentos recursos: ${comp.resourceLeaks.length}`);
        // console.log(`👀 Última visualização: ${new Date(comp.lastSeen).toLocaleString()}`);
        
        // Resource leaks específicos
        if (comp.resourceLeaks.length > 0) {
          console.table(comp.resourceLeaks.map(leak => ({
            Tipo: leak.type,
            'Idade (s)': Math.floor((now - leak.createdAt) / 1000),
            ID: leak.id.substring(0, 20) + '...'
          })));
        }
        
        console.groupEnd();
      });
      console.groupEnd();
    }
    
    // // Recomendações prioritárias
    // console.group('🎯 RECOMENDAÇÕES PRIORITÁRIAS');
    // if (criticalStores.length > 0) {
    //   console.log(`🚨 CRÍTICO: ${criticalStores.length} stores com vazamentos graves`);
    //   console.log(`   ↳ Foque em: ${criticalStores.slice(0, 3).map(s => s.storeName).join(', ')}`);
    // }
    // if (orphanComponents.length > 0) {
    //   console.log(`⚠️ ALTO: ${orphanComponents.length} componentes órfãos`);
    //   console.log(`   ↳ Priorize: ${orphanComponents.slice(0, 3).map(c => c.componentName).join(', ')}`);
    // }
    // if (this.resourceLeaks.length > 10) {
    //   console.log(`🔧 MÉDIO: ${this.resourceLeaks.length} vazamentos de recursos diversos`);
    // }
    console.groupEnd();
    
    console.groupEnd();
  }
}

// ===================================================
// 🌍 INTEGRAÇÃO GLOBAL
// ===================================================

const globalPerformanceMonitor = AdvancedPerformanceMonitor.getInstance();

// Integração com sistemas existentes
export const integrateWithManagedStores = () => {
  // Esta função será chamada pelos managed stores para reportar atividade
  return {
    trackSubscription: (storeName: string, id: string, type: string) =>
      globalPerformanceMonitor.trackStoreSubscription(storeName, id, type),
    trackCleanup: (storeName: string, id: string) =>
      globalPerformanceMonitor.trackStoreCleanup(storeName, id)
  };
};

// Hook React para monitoramento de componentes
export const useAdvancedPerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    globalPerformanceMonitor.trackComponentMount(componentName);
    
    return () => {
      globalPerformanceMonitor.trackComponentUnmount(componentName);
    };
  }, [componentName]);

  return {
    trackRender: (renderTime?: number) => 
      globalPerformanceMonitor.trackComponentRender(componentName, renderTime),
    trackResourceLeak: (type: ResourceLeak['type'], id: string, details?: any) =>
      globalPerformanceMonitor.trackResourceLeak(type, id, componentName, details)
  };
};

// Exposição global para debug apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  (window as any).pmcAdvancedMonitor = globalPerformanceMonitor;
  (window as any).pmcPrintReport = () => globalPerformanceMonitor.printDetailedReport();
  (window as any).pmcGetReport = () => globalPerformanceMonitor.generateComprehensiveReport();
  (window as any).pmcResetMonitor = () => globalPerformanceMonitor.reset();

  // 🔍 FUNÇÕES AVANÇADAS DE ANÁLISE - APENAS EM DESENVOLVIMENTO
  (window as any).pmcAnalyzeMemoryPattern = () => {
    const monitor = globalPerformanceMonitor;
    const snapshots = monitor.getMemorySnapshots().slice(-20);
    
    // if (snapshots.length < 2) {
    //   console.log('📊 Dados insuficientes para análise de padrão');
    //   return;
    // }

    // console.group('📈 ANÁLISE DE PADRÃO DE MEMÓRIA');
    
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const totalGrowth = last.usedJSHeapSize - first.usedJSHeapSize;
    const timeSpan = last.timestamp - first.timestamp;
    
    console.table({
      'Período Analisado': `${(timeSpan / 60000).toFixed(1)} minutos`,
      'Crescimento Total': `${(totalGrowth / 1024 / 1024).toFixed(2)} MB`,
      'Taxa Crescimento': `${((totalGrowth / timeSpan) * 60000 / 1024 / 1024).toFixed(2)} MB/min`,
      'Uso Atual': `${(last.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      'Utilização Heap': `${((last.usedJSHeapSize / last.jsHeapSizeLimit) * 100).toFixed(1)}%`
    });

    // Análise de tendência
    const growthPoints = [];
    for (let i = 1; i < snapshots.length; i++) {
      const growth = snapshots[i].usedJSHeapSize - snapshots[i-1].usedJSHeapSize;
      growthPoints.push(growth);
    }
    
    const avgGrowth = growthPoints.reduce((a, b) => a + b, 0) / growthPoints.length;
    const maxGrowth = Math.max(...growthPoints);
    const minGrowth = Math.min(...growthPoints);
    
    // console.log(`📊 Variação: ${(minGrowth / 1024 / 1024).toFixed(2)}MB a ${(maxGrowth / 1024 / 1024).toFixed(2)}MB (média: ${(avgGrowth / 1024 / 1024).toFixed(2)}MB)`);
    
    // if (avgGrowth > 5 * 1024 * 1024) { // >5MB crescimento médio
    //   console.warn('⚠️ PADRÃO SUSPEITO: Crescimento médio muito alto');
    // }
    
    console.groupEnd();
  };

  (window as any).pmcDetailedStoreAnalysis = () => {
    const monitor = globalPerformanceMonitor;
    
    console.group('🏪 ANÁLISE DETALHADA DAS STORES');
    
    const storeMetrics = Array.from(monitor.getStoreMetrics().values())
      .sort((a, b) => b.memoryLeakScore - a.memoryLeakScore);

    if (storeMetrics.length === 0) {
      console.log('📭 Nenhuma store registrada no monitor');
      console.groupEnd();
      return;
    }

    storeMetrics.forEach(store => {
      console.group(`🏪 Store: ${store.storeName}`);
      
      console.table({
        'Subscriptions Ativas': store.activeSubscriptions,
        'Total Criadas': store.totalSubscriptionsCreated,
        'Total Limpas': store.totalSubscriptionsCleaned,
        'Taxa Cleanup': `${store.totalSubscriptionsCreated > 0 ? ((store.totalSubscriptionsCleaned / store.totalSubscriptionsCreated) * 100).toFixed(1) : 0}%`,
        'Score Vazamento': `${store.memoryLeakScore.toFixed(1)}%`,
        'Tempo Médio Vida': `${(store.averageLifetime / 1000).toFixed(1)}s`,
        'Última Atividade': new Date(store.lastActivity).toLocaleTimeString()
      });

      // Análise das subscriptions
      const activeDetails = store.subscriptionDetails.filter(s => s.status === 'active');
      const leakedDetails = store.subscriptionDetails.filter(s => s.status === 'leaked');
      
      if (activeDetails.length > 0) {
        const longLived = activeDetails.filter(s => s.lifetime > 30000);
        if (longLived.length > 0) {
          console.warn(`⚠️ ${longLived.length} subscriptions de longa duração (>30s)`);
        }
      }
      
      if (leakedDetails.length > 0) {
        console.error(`❌ ${leakedDetails.length} subscriptions marcadas como vazamento`);
      }
      
      console.groupEnd();
    });
    
    console.groupEnd();
  };

  (window as any).pmcComponentLeakAnalysis = () => {
    const monitor = globalPerformanceMonitor;
    
    console.group('🧩 ANÁLISE DE VAZAMENTOS DE COMPONENTES');
    
    const componentMetrics = Array.from(monitor.getComponentMetrics().values())
      .filter(c => (c.mountCount - c.unmountCount) > 0 || c.resourceLeaks.length > 0)
      .sort((a, b) => (b.mountCount - b.unmountCount) - (a.mountCount - a.unmountCount));

    if (componentMetrics.length === 0) {
      console.log('✅ Nenhum vazamento de componente detectado');
      console.groupEnd();
      return;
    }

    componentMetrics.forEach(comp => {
      const deficit = comp.mountCount - comp.unmountCount;
      
      console.group(`🧩 ${comp.componentName} ${deficit > 0 ? '❌' : '✅'}`);
      
      console.table({
        'Montagens': comp.mountCount,
        'Desmontagens': comp.unmountCount,
        'Instâncias Órfãs': Math.max(0, deficit),
        'Total Renders': comp.renderCount,
        'Tempo Médio Render': `${comp.avgRenderTime.toFixed(2)}ms`,
        'Vazamentos Recursos': comp.resourceLeaks.length,
        'Última Atividade': new Date(comp.lastSeen).toLocaleTimeString()
      });

      if (comp.resourceLeaks.length > 0) {
        console.group('💧 Vazamentos de Recursos');
        const leaksByType = comp.resourceLeaks.reduce((acc, leak) => {
          acc[leak.type] = (acc[leak.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.table(leaksByType);
        console.groupEnd();
      }
      
      console.groupEnd();
    });
    
    console.groupEnd();
  };

  (window as any).pmcMemoryHotspots = () => {
    const monitor = globalPerformanceMonitor;
    const snapshots = monitor.getMemorySnapshots();
    const latest = snapshots[snapshots.length - 1];
    
    if (!latest) {
      console.log('📊 Nenhum snapshot de memória disponível');
      return;
    }

    console.group('🔥 HOTSPOTS DE MEMÓRIA');
    
    // Verificar se as propriedades existem antes de usá-las
    if (latest.storeMemoryUsage) {
      const storeHotspots = Object.entries(latest.storeMemoryUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
        
      if (storeHotspots.length > 0) {
        console.group('🏪 Top Stores por Memória');
        console.table(storeHotspots.reduce((acc, [store, memory]) => {
          acc[store] = `${(memory / 1024).toFixed(1)} KB`;
          return acc;
        }, {} as Record<string, string>));
        console.groupEnd();
      }
    }

    if (latest.componentMemoryUsage) {
      const componentHotspots = Object.entries(latest.componentMemoryUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
        
      if (componentHotspots.length > 0) {
        console.group('🧩 Top Componentes por Memória');
        console.table(componentHotspots.reduce((acc, [comp, memory]) => {
          acc[comp] = `${(memory / 1024).toFixed(1)} KB`;
          return acc;
        }, {} as Record<string, string>));
        console.groupEnd();
      }
    }

    if (latest.resourceCount) {
      const resourceHotspots = Object.entries(latest.resourceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
        
      if (resourceHotspots.length > 0) {
        console.group('📊 Recursos Mais Numerosos');
        console.table(resourceHotspots.reduce((acc, [resource, count]) => {
          acc[resource] = count;
          return acc;
        }, {} as Record<string, number>));
        console.groupEnd();
      }
    }
    
    console.groupEnd();
  };
}

export default AdvancedPerformanceMonitor; 