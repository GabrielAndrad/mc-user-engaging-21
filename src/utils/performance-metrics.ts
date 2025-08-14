interface StreamMetrics {
  streamName: string;
  subscriptionCount: number;
  cacheHitCount: number;
  cacheMissCount: number;
  errorCount: number;
  totalLoadTime: number;
  lastActivity: Date;
  averageLoadTime: number;
  memoryUsage: number;
  performance: {
    fastResponses: number; // < 100ms
    mediumResponses: number; // 100-500ms  
    slowResponses: number; // > 500ms
  };
}

interface PerformanceReport {
  totalStreams: number;
  totalSubscriptions: number;
  cacheEfficiency: number; // %
  averageResponseTime: number;
  errorRate: number; // %
  memoryUsage: number;
  streamDetails: StreamMetrics[];
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: Map<string, StreamMetrics> = new Map();
  private isEnabled: boolean = true;
  private reportInterval: NodeJS.Timer | null = null;
  private isRunning: boolean = false;
  private startTime: number = 0;

  constructor() {
    // 🎯 Inicializar métricas apenas em desenvolvimento
    this.isEnabled = process.env.NODE_ENV === 'development';
    
    if (this.isEnabled) {
      this.startPeriodicReporting();
    }
  }

  // ✅ REGISTRAR STREAM
  registerStream(streamName: string): void {
    if (!this.isEnabled) return;

    if (!this.metrics.has(streamName)) {
      this.metrics.set(streamName, {
        streamName,
        subscriptionCount: 0,
        cacheHitCount: 0,
        cacheMissCount: 0,
        errorCount: 0,
        totalLoadTime: 0,
        lastActivity: new Date(),
        averageLoadTime: 0,
        memoryUsage: 0,
        performance: {
          fastResponses: 0,
          mediumResponses: 0,
          slowResponses: 0
        }
      });
    }
  }

  // ✅ REGISTRAR ATIVIDADE
  recordActivity(streamName: string, type: 'subscription' | 'cache-hit' | 'cache-miss' | 'error', duration?: number): void {
    if (!this.isEnabled) return;

    const metrics = this.metrics.get(streamName);
    if (!metrics) return;

    metrics.lastActivity = new Date();

    switch (type) {
      case 'subscription':
        metrics.subscriptionCount++;
        if (duration !== undefined) {
          metrics.totalLoadTime += duration;
          metrics.averageLoadTime = metrics.totalLoadTime / metrics.subscriptionCount;
          
          // Categorizar performance
          if (duration < 100) metrics.performance.fastResponses++;
          else if (duration < 500) metrics.performance.mediumResponses++;
          else metrics.performance.slowResponses++;
        }
        break;
      case 'cache-hit':
        metrics.cacheHitCount++;
        break;
      case 'cache-miss':
        metrics.cacheMissCount++;
        break;
      case 'error':
        metrics.errorCount++;
        break;
    }

    // Calcular uso de memória (aproximado)
    metrics.memoryUsage = this.estimateMemoryUsage(streamName);
  }

  // ✅ GERAR RELATÓRIO
  generateReport(): PerformanceReport {
    if (!this.isEnabled) {
      return {
        totalStreams: 0,
        totalSubscriptions: 0,
        cacheEfficiency: 0,
        averageResponseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        streamDetails: [],
        recommendations: ['Sistema de métricas desabilitado em produção']
      };
    }

    const streamDetails = Array.from(this.metrics.values());
    const totalSubscriptions = streamDetails.reduce((sum, m) => sum + m.subscriptionCount, 0);
    const totalCacheHits = streamDetails.reduce((sum, m) => sum + m.cacheHitCount, 0);
    const totalCacheMisses = streamDetails.reduce((sum, m) => sum + m.cacheMissCount, 0);
    const totalErrors = streamDetails.reduce((sum, m) => sum + m.errorCount, 0);
    const totalLoadTime = streamDetails.reduce((sum, m) => sum + m.totalLoadTime, 0);
    const totalMemory = streamDetails.reduce((sum, m) => sum + m.memoryUsage, 0);

    const cacheEfficiency = totalCacheHits + totalCacheMisses > 0 
      ? (totalCacheHits / (totalCacheHits + totalCacheMisses)) * 100 
      : 0;

    const averageResponseTime = totalSubscriptions > 0 ? totalLoadTime / totalSubscriptions : 0;
    const errorRate = totalSubscriptions > 0 ? (totalErrors / totalSubscriptions) * 100 : 0;

    return {
      totalStreams: streamDetails.length,
      totalSubscriptions,
      cacheEfficiency,
      averageResponseTime,
      errorRate,
      memoryUsage: totalMemory,
      streamDetails,
      recommendations: this.generateRecommendations(streamDetails, cacheEfficiency, errorRate, averageResponseTime)
    };
  }

  // ✅ GERAR RECOMENDAÇÕES
  private generateRecommendations(
    streams: StreamMetrics[], 
    cacheEfficiency: number, 
    errorRate: number, 
    avgResponseTime: number
  ): string[] {
    const recommendations: string[] = [];

    if (cacheEfficiency < 70) {
      recommendations.push('📈 Considere aumentar a duração do cache para melhorar a eficiência');
    }

    if (errorRate > 5) {
      recommendations.push('⚠️ Taxa de erro alta detectada - revisar tratamento de erros');
    }

    if (avgResponseTime > 300) {
      recommendations.push('🐌 Tempo de resposta médio alto - otimizar carregadores iniciais');
    }

    const slowStreams = streams.filter(s => s.averageLoadTime > 500);
    if (slowStreams.length > 0) {
      recommendations.push(`🎯 Otimizar streams lentos: ${slowStreams.map(s => s.streamName).join(', ')}`);
    }

    const errorProneStreams = streams.filter(s => s.errorCount > 10);
    if (errorProneStreams.length > 0) {
      recommendations.push(`❌ Revisar streams com muitos erros: ${errorProneStreams.map(s => s.streamName).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance dos streams está otimizada!');
    }

    return recommendations;
  }

  // ✅ ESTIMAR USO DE MEMÓRIA
  private estimateMemoryUsage(streamName: string): number {
    // Estimativa aproximada baseada em atividade
    const metrics = this.metrics.get(streamName);
    if (!metrics) return 0;
    
    return (metrics.subscriptionCount * 0.1) + (metrics.cacheHitCount * 0.05);
  }

  // ✅ RELATÓRIO PERIÓDICO
  private startPeriodicReporting(): void {
    this.reportInterval = setInterval(() => {
      const report = this.generateReport();
      
      if (report.totalStreams > 0) {
        console.group('📊 [PerformanceMonitor] Relatório Periódico');
        console.log(`🔢 Total de Streams: ${report.totalStreams}`);
        console.log(`📡 Total de Subscriptions: ${report.totalSubscriptions}`);
        console.log(`⚡ Eficiência do Cache: ${report.cacheEfficiency.toFixed(1)}%`);
        console.log(`⏱️ Tempo de Resposta Médio: ${report.averageResponseTime.toFixed(0)}ms`);
        console.log(`❌ Taxa de Erro: ${report.errorRate.toFixed(1)}%`);
        console.log(`💾 Uso de Memória: ${report.memoryUsage.toFixed(1)}KB`);
        
        if (report.recommendations.length > 0) {
          console.log('💡 Recomendações:');
          report.recommendations.forEach(rec => console.log(`  ${rec}`));
        }
        
        console.groupEnd();
      }
    }, 60000); // A cada minuto
  }

  start(): void {
    this.isRunning = true;
    this.startTime = Date.now();
  }

  stop(): void {
    this.isRunning = false;
  }

  // ✅ EXPORTAR MÉTRICAS
  exportMetrics(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  // ✅ LIMPAR MÉTRICAS ANTIGAS
  cleanupOldMetrics(): void {
    if (!this.isEnabled) return;

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
    
    for (const [streamName, metrics] of this.metrics.entries()) {
      if (metrics.lastActivity < cutoff) {
        this.metrics.delete(streamName);
      }
    }
  }

  private cleanupInactiveStreams(): void {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutos
    
    for (const [streamName, metrics] of this.metrics.entries()) {
      if (now - metrics.lastActivity.getTime() > inactiveThreshold) {
        this.metrics.delete(streamName);
      }
    }
  }

  // Manual debug method - can use console.log freely
  printReport(): void {
    const report = this.generateReport();
    
    console.group('📊 Performance Metrics Report');
    console.log(`🔢 Total de Streams: ${report.totalStreams}`);
    console.log(`📡 Total de Subscriptions: ${report.totalSubscriptions}`);
    console.log(`⚡ Eficiência do Cache: ${report.cacheEfficiency.toFixed(1)}%`);
    console.log(`⏱️ Tempo de Resposta Médio: ${report.averageResponseTime.toFixed(0)}ms`);
    console.log(`❌ Taxa de Erro: ${report.errorRate.toFixed(1)}%`);
    console.log(`💾 Uso de Memória: ${report.memoryUsage.toFixed(1)}KB`);
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recomendações:');
      report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }
    console.groupEnd();
  }

  // Manual debug method - can use console.log freely
  fullReport(): void {
    const report = this.generateReport();
    console.log('📊 Full Report:', report);
  }
}

// 🌟 INSTÂNCIA SINGLETON
export const performanceMonitor = new PerformanceMonitor();

// 🎯 HELPER FUNCTIONS
export const recordStreamActivity = (streamName: string, type: 'subscription' | 'cache-hit' | 'cache-miss' | 'error', duration?: number) => {
  performanceMonitor.recordActivity(streamName, type, duration);
};

export const registerStream = (streamName: string) => {
  performanceMonitor.registerStream(streamName);
};

export const getPerformanceReport = () => {
  return performanceMonitor.generateReport();
};

// 🧪 FUNÇÃO PARA DEBUG EM DEVELOPMENT
export const logPerformanceReport = () => {
  if (process.env.NODE_ENV === 'development') {
    const report = performanceMonitor.generateReport();
    console.table(report.streamDetails);
    console.log('📊 Full Report:', report);
  }
};

// 🧹 CLEANUP AUTOMÁTICO
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.stop();
  });
} 