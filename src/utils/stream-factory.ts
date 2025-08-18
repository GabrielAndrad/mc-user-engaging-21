// safe-stream.ts
import { Observable, combineLatest, of, EMPTY } from 'rxjs';
import { map, debounceTime, shareReplay, catchError, tap, distinctUntilChanged, startWith } from 'rxjs/operators';
import { registerStream, recordStreamActivity } from './performance-metrics';

// ✅ INTERFACE ORIGINAL MANTIDA + NOVAS OTIMIZAÇÕES
export interface StreamConfig<T> {
  streamName: string;
  initialLoaders: (() => void)[];
  stores: Observable<any>[];
  mapper: (storeValues: any[]) => T;
  
  // ✅ PARÂMETROS ORIGINAIS MANTIDOS PARA COMPATIBILIDADE
  cacheDuration?: number;    // em ms, padrão 2 minutos
  debounceDelay?: number;    // em ms, padrão 100ms
  maxCacheSize?: number;     // padrão 10
  
  // ⚡ NOVOS PARÂMETROS OPCIONAIS (NÃO QUEBRAM COMPATIBILIDADE)
  cacheMs?: number;        // Cache duration (novo)
  debounceMs?: number;     // Debounce delay (novo)
  isUIComponent?: boolean; // Para componentes de UI (menu, etc)
  isCriticalPath?: boolean; // Para dados críticos
  
  onError?: (error: any) => void;
  onCleanup?: () => void;
}

interface OptimizedCache<T> {
  observable: Observable<T>;
  timestamp: number;
  hitCount: number;
  lastAccess: number;
  size: number; // Estimated memory size
}

// ⚡ CACHE INTELIGENTE COM LRU
const streamCache = new Map<string, OptimizedCache<any>>();

// 🧠 MEMOIZAÇÃO DE MAPPERS
const mapperCache = new Map<string, { input: string, output: any, timestamp: number }>();

// 📊 MÉTRICAS SIMPLIFICADAS (APENAS EM DEV)
let metricsEnabled = false;
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  metricsEnabled = true;
}

/**
 * 📊 MÉTRICAS ESPECIALIZADAS PARA STREAMS
 */
interface StreamTracker {
  name: string;
  type: 'component' | 'data';
  createdAt: number;
  lastActivity: number;
  hitCount: number;
}

// 📈 REGISTRO DE STREAMS ATIVAS
const componentStreams = new Map<string, StreamTracker>();
const dataStreams = new Map<string, StreamTracker>();

/**
 * 📊 ESTATÍSTICAS COMPLETAS DE STREAMS
 */
export const getStreamStats = () => {
  const now = Date.now();
  
  const componentStats = Array.from(componentStreams.values()).map(stream => ({
    name: stream.name,
    type: 'COMPONENTE UI',
    ageInMinutes: Math.floor((now - stream.createdAt) / 60000),
    lastActivityMinutes: Math.floor((now - stream.lastActivity) / 60000),
    hitCount: stream.hitCount
  }));
  
  const dataStats = Array.from(dataStreams.values()).map(stream => ({
    name: stream.name,
    type: 'DADOS AUXILIARES',
    ageInMinutes: Math.floor((now - stream.createdAt) / 60000),
    lastActivityMinutes: Math.floor((now - stream.lastActivity) / 60000),
    hitCount: stream.hitCount
  }));
  
  return {
    summary: {
      totalComponentStreams: componentStreams.size,
      totalDataStreams: dataStreams.size,
      totalStreams: componentStreams.size + dataStreams.size
    },
    componentStreams: componentStats,
    dataStreams: dataStats,
    allStreams: [...componentStats, ...dataStats]
  };
};

/**
 * 🎯 LOG FORMATADO PARA CONSOLE
 */
export const logStreamStats = () => {
  const stats = getStreamStats();
  
  // console.group('🎯 [STREAM FACTORY] Status das Streams:');
  
  // if (stats.componentStreams.length > 0) {
  //   console.log(`🖥️ COMPONENTES UI (refCount: true):`);
  //   console.table(stats.componentStreams);
  // }
  
  // if (stats.dataStreams.length > 0) {
  //   console.log(`📊 DADOS AUXILIARES (cached):`);
  //   console.table(stats.dataStreams);
  // }
  
  console.groupEnd();
  
  return stats;
};

/**
 * 🔗 COMBINAR COM STATS GLOBAIS
 */
export const getCompleteSystemStats = () => {
  // Importar função global se disponível
  const globalStats = (window as any).getGlobalStoreStats ? (window as any).getGlobalStoreStats() : null;
  const streamStats = getStreamStats();
  
  return {
    stores: globalStats,
    streams: streamStats,
    timestamp: new Date().toISOString()
  };
};

/**
 * 📊 LOG COMPLETO DO SISTEMA
 */
export const logCompleteSystemStats = () => {
  const completeStats = getCompleteSystemStats();
  
  console.group('🌍 [SISTEMA COMPLETO] Análise de Memória:');
  
  // if (completeStats.stores) {
  //   console.log(`📦 STORES: ${completeStats.stores.totalActiveSubscriptions} subscriptions em ${completeStats.stores.totalStores} stores`);
  // }
  
  // console.log(`🎯 STREAMS: ${completeStats.streams.summary.totalStreams} ativas (${completeStats.streams.summary.totalComponentStreams} UI + ${completeStats.streams.summary.totalDataStreams} dados)`);
  
  // Mostrar detalhes das streams
  logStreamStats();
  
  console.groupEnd();
  
  return completeStats;
};

/**
 * ✅ FUNÇÃO PRINCIPAL REFATORADA - PRIORIDADE PARA COMPONENTES UI
 * REGRA: Componentes/Telas = SEM CACHE + SUBSCRIPTIONS SEMPRE ATIVAS
 */
export const createSafeStream = <T>(config: StreamConfig<T>): Observable<T> => {
  const {
    streamName,
    initialLoaders,
    stores,
    mapper,
    // ✅ SUPORTE AOS PARÂMETROS ORIGINAIS
    cacheDuration,
    debounceDelay,
    maxCacheSize,
    // ⚡ NOVOS PARÂMETROS OPCIONAIS
    cacheMs,
    debounceMs,
    isUIComponent = false,
    isCriticalPath = false,
    onError,
    onCleanup
  } = config;

  // 🎯 DETECTAR SE É COMPONENTE/TELA (REGRA: TODOS QUE USAM SAFESTREAM SÃO UI)
  const isComponentOrScreen = true; // ✅ TODOS são componentes por definição
  const isFilterComponent = streamName.toLowerCase().includes('filter');
  const isFormComponent = streamName.toLowerCase().includes('form') || streamName.toLowerCase().includes('modal');
  
  // 🔤 DETECTAR SE É COMPONENTE DE FORMULÁRIO (PARA EVITAR PROBLEMAS COM ACENTOS)
  const isFormInputComponent = streamName.toLowerCase().includes('tarefa') || 
                               streamName.toLowerCase().includes('form') ||
                               streamName.toLowerCase().includes('modal') ||
                               streamName.toLowerCase().includes('edit');
  
  // ⚡ CONFIGURAÇÕES OTIMIZADAS PARA COMPONENTES
  const finalConfig = getFinalConfig({
    cacheDuration,
    debounceDelay,
    maxCacheSize,
    cacheMs,
    debounceMs,
    isUIComponent: true, // ✅ FORÇAR COMO UI
    isCriticalPath,
    isFormInputComponent // ✅ NOVA FLAG PARA FORMULÁRIOS
  });

  if (metricsEnabled) {
    // console.log(`🖥️ [${streamName}] COMPONENTE UI: Cache DESABILITADO, Subscription SEMPRE ATIVA`);
  }

  // 📈 REGISTRAR STREAM DE COMPONENTE
  componentStreams.set(streamName, {
    name: streamName,
    type: 'component',
    createdAt: Date.now(),
    lastActivity: Date.now(),
    hitCount: 0
  });

  // 🚀 SEMPRE EXECUTAR LOADERS PARA COMPONENTES (SEM CACHE)
  executeLoadersOptimized(initialLoaders, streamName);

  // 🧠 MAPPER OTIMIZADO MAS SEM CACHE EXCESSIVO PARA UI
  const lightMapper = createLightMapper(mapper, streamName);

  // 🎯 STREAM OTIMIZADA PARA COMPONENTES UI
  const uiOptimizedStream$ = combineLatest(stores).pipe(
    // ⚡ DEBOUNCE CONDICIONAL: ZERO PARA FORMULÁRIOS (EVITAR PROBLEMAS COM ACENTOS)
    finalConfig.finalDebounceMs > 0 && !isFormInputComponent ? debounceTime(finalConfig.finalDebounceMs) : tap(() => {}),
    
    // 🧠 MAPPER LEVE
    map(lightMapper),
    
    // 🔄 EVITAR EMISSÕES DUPLICADAS
    distinctUntilChanged(),
    
    // 🚨 ERROR HANDLING PARA UI
    catchError(error => {
      if (metricsEnabled) {
        console.error(`💥 [${streamName}] UI Component error:`, error);
      }
      
      onError && onError(error);
      return of(getUIFallback(streamName));
    }),
    
    // 🎯 SHARE REPLAY PARA COMPONENTES: refCount TRUE = SUBSCRIPTIONS ATIVAS
    shareReplay({ 
      bufferSize: 1, 
      refCount: true // ✅ TRUE = Mantém subscription enquanto há subscribers
    })
  );

  // 📊 MÉTRICAS PARA COMPONENTES (SEM CACHE)
  if (metricsEnabled) {
    // console.log(`✅ [${streamName}] UI Stream criada - refCount:true, cache:disabled`);
    if (isFormInputComponent) {
      console.log(`🔤 [${streamName}] FORMULÁRIO: Debounce DESABILITADO para evitar problemas com acentos`);
    }
  }
  
  return uiOptimizedStream$;
};

/**
 * ✅ CONFIGURAÇÕES COM TOTAL RETROCOMPATIBILIDADE
 */
function getFinalConfig(config: any) {
  const {
    cacheDuration,
    debounceDelay,
    maxCacheSize,
    cacheMs,
    debounceMs,
    isUIComponent,
    isCriticalPath,
    isFormInputComponent
  } = config;

  // ✅ PRIORIZAR PARÂMETROS ORIGINAIS SE FORNECIDOS
  let finalCacheMs = cacheDuration || cacheMs;
  let finalDebounceMs = debounceDelay || debounceMs;
  let finalMaxCacheSize = maxCacheSize;

  // ⚡ APLICAR OTIMIZAÇÕES APENAS SE NÃO FORAM ESPECIFICADOS
  if (!finalCacheMs) {
    if (isUIComponent) {
      finalCacheMs = 30000;      // 30s para UI
    } else if (isCriticalPath) {
      finalCacheMs = 60000;      // 1min para critical
    } else {
      finalCacheMs = 120000;     // 2min padrão original
    }
  }

  if (!finalDebounceMs && finalDebounceMs !== 0) {
    // 🚫 DESABILITAR DEBOUNCE GLOBALMENTE - RESPONSIVIDADE MÁXIMA
    finalDebounceMs = 0;       // ✅ ZERO para TODOS os casos - máxima responsividade
    
    // ✅ CÓDIGO ANTERIOR COMENTADO PARA REFERÊNCIA:
    // if (isFormInputComponent) {
    //   finalDebounceMs = 0;       // 🔤 ZERO para formulários (evitar problemas com acentos)
    // } else if (isUIComponent) {
    //   finalDebounceMs = 25;      // 25ms para UI
    // } else if (isCriticalPath) {
    //   finalDebounceMs = 50;      // 50ms para critical
    // } else {
    //   finalDebounceMs = 100;     // 100ms padrão original
    // }
  }

  if (!finalMaxCacheSize) {
    finalMaxCacheSize = 10;      // Padrão original
  }

  return { finalCacheMs, finalDebounceMs, finalMaxCacheSize };
}

/**
 * 🧠 MAPPER LEVE PARA COMPONENTES UI
 * Sem cache pesado - componentes precisam de atualizações imediatas
 */
function createLightMapper<T>(mapper: (values: any[]) => T, streamName: string) {
  return (storeValues: any[]): T => {
    // ⚡ PROCESSAR DIRETO SEM CACHE PARA UI RESPONSIVA
    const safeValues = storeValues.map(value => value || {});
    const result = mapper(safeValues);
    
    if (metricsEnabled) {
      // console.log(`🧠 [${streamName}] UI Mapper: processamento direto (sem cache)`);
    }
    
    return result;
  };
}

/**
 * 🧠 MEMOIZAÇÃO INTELIGENTE DE MAPPERS (PARA DADOS AUXILIARES)
 */
function createMemoizedMapper<T>(mapper: (values: any[]) => T, streamName: string) {
  return (storeValues: any[]): T => {
    // 🔍 CRIAR HASH DOS INPUTS
    const inputHash = createFastHash(storeValues);
    const cacheKey = `${streamName}_mapper`;
    
    // 🎯 VERIFICAR CACHE DO MAPPER
    const cached = mapperCache.get(cacheKey);
    if (cached && cached.input === inputHash) {
      if (metricsEnabled) {
        console.log(`🧠 [${streamName}] Mapper cache HIT`);
      }
      return cached.output;
    }

    // ⚡ PROCESSAR E CACHEAR
    const safeValues = storeValues.map(value => value || {});
    const result = mapper(safeValues);
    
    mapperCache.set(cacheKey, {
      input: inputHash,
      output: result,
      timestamp: Date.now()
    });

    if (metricsEnabled) {
      console.log(`⚙️ [${streamName}] Mapper processed & cached`);
    }

    return result;
  };
}

/**
 * ⚡ EXECUÇÃO OTIMIZADA DE LOADERS
 */
function executeLoadersOptimized(loaders: (() => void)[], streamName: string) {
  try {
    loaders.forEach((loader, index) => {
      try {
        loader();
      } catch (error) {
        console.warn(`⚠️ [${streamName}] Loader ${index} error:`, error);
      }
    });
  } catch (error) {
    console.warn(`⚠️ [${streamName}] Loaders general error:`, error);
  }
}

/**
 * 🔍 HASH RÁPIDO PARA COMPARAÇÃO
 */
function createFastHash(obj: any): string {
  return JSON.stringify(obj).length + '_' + typeof obj;
}

/**
 * 🎮 FALLBACK PARA COMPONENTES UI
 */
function getUIFallback(streamName: string): any {
  if (streamName.toLowerCase().includes('menu')) {
    return { menuItems: [], loading: false, error: null };
  }
  return { loading: false, error: 'Stream error', data: null };
}

/**
 * 📏 ESTIMATIVA DE TAMANHO DA STREAM
 */
function estimateStreamSize(storeCount: number): number {
  return storeCount * 1024; // 1KB por store estimado
}

/**
 * 🧹 MANUTENÇÃO INTELIGENTE DO CACHE (LRU)
 */
function maintainCacheSize(maxSize: number) {
  if (streamCache.size <= maxSize) return;

  // 🗑️ REMOVER OS MENOS ACESSADOS RECENTEMENTE
  const entries = [...streamCache.entries()]
    .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

  const toRemove = entries.slice(0, streamCache.size - maxSize);
  toRemove.forEach(([key]) => {
    streamCache.delete(key);
    if (metricsEnabled) {
      console.log(`🗑️ Evicted cache: ${key}`);
    }
  });
}

/**
 * ✅ VERSÃO BÁSICA ORIGINAL MANTIDA - TOTAL COMPATIBILIDADE
 */
export const createBasicStream = <T>(
  streamName: string,
  initialLoaders: (() => void)[],
  stores: Observable<any>[],
  mapper: (storeValues: any[]) => T
): Observable<T> => {
  return createSafeStream({
    streamName,
    initialLoaders,
    stores,
    mapper,
    cacheDuration: 180000, // 3 minutos para streams básicos (ORIGINAL)
    debounceDelay: 50,     // 50ms mais rápido (ORIGINAL)
    maxCacheSize: 15       // ORIGINAL
  });
};

/**
 * ⚡ CRIAÇÃO RÁPIDA PARA COMPONENTES UI (NOVA)
 */
export const createUIStream = <T>(
  streamName: string,
  initialLoaders: (() => void)[],
  stores: Observable<any>[],
  mapper: (storeValues: any[]) => T
): Observable<T> => {
  return createSafeStream({
    streamName,
    initialLoaders,
    stores,
    mapper,
    isUIComponent: true
  });
};

/**
 * ⚡ CRIAÇÃO RÁPIDA PARA DADOS CRÍTICOS (NOVA)
 */
export const createCriticalStream = <T>(
  streamName: string,
  initialLoaders: (() => void)[],
  stores: Observable<any>[],
  mapper: (storeValues: any[]) => T
): Observable<T> => {
  return createSafeStream({
    streamName,
    initialLoaders,
    stores,
    mapper,
    isCriticalPath: true
  });
};

/**
 * 🧹 LIMPEZA AUTOMÁTICA MAIS AGRESSIVA (MANTIDA PARA COMPATIBILIDADE)
 */
let cleanupInterval: NodeJS.Timeout | null = null;

function startAggressiveCleanup() {
  if (cleanupInterval) clearInterval(cleanupInterval);
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    
    // 🗑️ LIMPAR MAPPER CACHE ANTIGO (>2min)
    for (const [key, value] of mapperCache.entries()) {
      if (now - value.timestamp > 120000) {
        mapperCache.delete(key);
      }
    }
    
    // 🗑️ LIMPAR STREAMS MUITO ANTIGAS (>10min)
    for (const [key, value] of streamCache.entries()) {
      if (now - value.lastAccess > 600000) {
        streamCache.delete(key);
      }
    }
    
    // if (metricsEnabled) {
    //   console.log(`🧹 Cleanup: ${streamCache.size} streams, ${mapperCache.size} mappers`);
    // }
  }, 120000); // A cada 2 minutos
}

/**
 * 🔍 DEBUG UTILITÁRIOS
 */
export const debugStreams = () => {
  const stats = getStreamStats();
  
  if (stats.componentStreams.length > 0) {
    // Removido console.log de componentes UI header
    // stats.componentStreams.forEach removido console.log
  }

  if (stats.dataStreams.length > 0) {
    // Removido console.log de dados auxiliares header
    // stats.dataStreams.forEach removido console.log
  }
};

export const clearStreamCache = (streamName?: string) => {
  if (streamName) {
    const deleted1 = streamCache.delete(`${streamName}_v2`);
    const deleted2 = mapperCache.delete(`${streamName}_mapper`);
    const deleted3 = streamCache.delete(`${streamName}_data_v2`);
    
    // 🧹 LIMPAR TRACKERS TAMBÉM
    const deletedComponent = componentStreams.delete(streamName);
    const deletedData = dataStreams.delete(streamName);
    
    // Removido console.log de cleared specific
  } else {
    const streamCount = streamCache.size;
    const mapperCount = mapperCache.size;
    const componentCount = componentStreams.size;
    const dataCount = dataStreams.size;
    
    streamCache.clear();
    mapperCache.clear();
    componentStreams.clear();
    dataStreams.clear();
    
    // Removido console.log de cleared ALL
  }
};

/**
 * 🕐 LIMPEZA AUTOMÁTICA PERIÓDICA
 */
let autoCleanupInterval: NodeJS.Timeout | null = null;

export const startAutoCleanup = (intervalMinutes: number = 3) => {
  if (autoCleanupInterval) {
    clearInterval(autoCleanupInterval);
  }
  
  autoCleanupInterval = setInterval(() => {
    // console.log('🧹 [Stream Factory] Executando limpeza automática...');
    cleanupOrphanStreams();
  }, intervalMinutes * 60 * 1000);
  
  // console.log(`🔄 [Stream Factory] Auto cleanup iniciado (${intervalMinutes} min)`);
};

export const stopAutoCleanup = () => {
  if (autoCleanupInterval) {
    clearInterval(autoCleanupInterval);
    autoCleanupInterval = null;
    // Removido console.log de auto cleanup stopped
  }
};

// 🚀 INICIAR AUTO-CLEANUP EM DEV
if (metricsEnabled) {
  startAutoCleanup(3); // ✅ MUDANÇA: A cada 3 minutos (balanceado)
}

/**
 * 📊 CRIAR STREAM PARA DADOS AUXILIARES (COM CACHE)
 * Para dados que NÃO são componentes UI diretos
 */
export const createDataStream = <T>(config: StreamConfig<T>): Observable<T> => {
  const {
    streamName,
    initialLoaders,
    stores,
    mapper,
    cacheDuration,
    debounceDelay,
    maxCacheSize,
    cacheMs,
    debounceMs,
    isUIComponent = false,
    isCriticalPath = false,
    onError,
    onCleanup
  } = config;

  // ⚡ CONFIGURAÇÕES PARA DADOS AUXILIARES
  const finalConfig = getFinalConfig({
    cacheDuration,
    debounceDelay,
    maxCacheSize,
    cacheMs,
    debounceMs,
    isUIComponent,
    isCriticalPath
  });

  const cacheKey = `${streamName}_data_v2`;
  const now = Date.now();

  // 🎯 VERIFICAR CACHE PARA DADOS AUXILIARES
  const cached = streamCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < finalConfig.finalCacheMs) {
    cached.hitCount++;
    cached.lastAccess = now;
    
    // 📈 ATUALIZAR TRACKING DE HIT COUNT
    const existingTracker = dataStreams.get(streamName);
    if (existingTracker) {
      existingTracker.hitCount = cached.hitCount;
      existingTracker.lastActivity = now;
    }
    
    // if (metricsEnabled) {
    //   console.log(`📊 [${streamName}] DATA Cache HIT (${cached.hitCount} hits)`);
    // }
    
    return cached.observable as Observable<T>;
  }

  if (metricsEnabled) {
    // console.log(`📊 [${streamName}] Creating DATA stream (cached)`);
  }

  // 📈 REGISTRAR STREAM DE DADOS AUXILIARES
  dataStreams.set(streamName, {
    name: streamName,
    type: 'data',
    createdAt: Date.now(),
    lastActivity: Date.now(),
    hitCount: cached ? cached.hitCount + 1 : 0
  });

  // ⚡ EXECUÇÃO CONDICIONAL DE LOADERS
  if (!cached || isCriticalPath) {
    executeLoadersOptimized(initialLoaders, streamName);
  }

  // 🧠 MAPPER COM MEMOIZAÇÃO PARA DADOS
  const memoizedMapper = createMemoizedMapper(mapper, streamName);

  // 📊 STREAM PARA DADOS AUXILIARES
  const dataStream$ = combineLatest(stores).pipe(
    finalConfig.finalDebounceMs > 0 ? debounceTime(finalConfig.finalDebounceMs) : tap(() => {}),
    distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev).length === JSON.stringify(curr).length;
    }),
    map(memoizedMapper),
    distinctUntilChanged(),
    catchError(error => {
      if (metricsEnabled) {
        console.error(`💥 [${streamName}] Data stream error:`, error);
      }
      onError && onError(error);
      return of({} as T);
    }),
    shareReplay({ 
      bufferSize: 1, 
      refCount: false // ✅ FALSE para dados auxiliares (podem ser cached)
    })
  );

  // 💾 CACHE PARA DADOS AUXILIARES
  const estimatedSize = estimateStreamSize(stores.length);
  streamCache.set(cacheKey, {
    observable: dataStream$,
    timestamp: now,
    hitCount: 0,
    lastAccess: now,
    size: estimatedSize
  });

  maintainCacheSize(finalConfig.finalMaxCacheSize);
  return dataStream$;
};

/**
 * 🧹 AUTO-CLEANUP DE STREAMS ÓRFÃS
 */

// 🎯 DETECTAR COMPONENTES ÓRFÃOS
const detectOrphanStreams = (): string[] => {
  const orphans: string[] = [];
  const now = Date.now();
  
  for (const [streamName, tracker] of componentStreams.entries()) {
    let isOrphan = false;
    
    // 🕐 CRITÉRIO 1: Streams com mais de 1 minuto de inatividade (mais agressivo)
    const inactiveMinutes = Math.floor((now - tracker.lastActivity) / 60000);
    
    if (inactiveMinutes >= 1) {
      // 🔍 CRITÉRIO 2: Tentar detectar se o elemento ainda existe no DOM
      const possibleSelectors = [
        `[data-stream="${streamName}"]`,
        `[data-component="${streamName}"]`,
        `.${streamName.toLowerCase()}`,
        `#${streamName.toLowerCase()}`,
        `[class*="${streamName}"]`,
        `[id*="${streamName}"]`
      ];
      
      let elementExists = false;
      for (const selector of possibleSelectors) {
        try {
          if (document.querySelector(selector)) {
            elementExists = true;
            break;
          }
        } catch (e) {
          // Ignore selector errors
        }
      }
      
      // 🎯 CRITÉRIO 3: Streams de Modal (sempre órfãs se inativas > 30s)
      const isModal = streamName.toLowerCase().includes('modal');
      if (isModal && inactiveMinutes >= 0.5) { // 30 segundos para modais
        isOrphan = true;
      }
      
      // 🎯 CRITÉRIO 4: Streams de telas antigas (baseado na URL atual)
      const currentPath = window.location.pathname;
      const isCurrentScreen = currentPath.includes(streamName.toLowerCase()) || 
                             streamName.toLowerCase().includes('router') ||
                             streamName.toLowerCase().includes('notification') ||
                             streamName.toLowerCase().includes('auth');
      
      if (!elementExists && !isCurrentScreen) {
        isOrphan = true;
      }
      
      if (isOrphan) {
        orphans.push(streamName);
        
        if (metricsEnabled) {
          // console.log(`👻 [ORPHAN DETECTED] ${streamName}: inactive=${inactiveMinutes}min, modal=${isModal}, inDOM=${elementExists}, currentScreen=${isCurrentScreen}`);
        }
      }
    }
  }
  
  return orphans;
};

// 🧹 LIMPEZA AUTOMÁTICA DE ÓRFÃOS
export const cleanupOrphanStreams = (): number => {
  const orphans = detectOrphanStreams();
  let cleaned = 0;
  
  orphans.forEach(streamName => {
    // 🗑️ Remover do tracking
    if (componentStreams.delete(streamName)) {
      cleaned++;
      
      // 🗑️ Limpar caches relacionados  
      streamCache.delete(`${streamName}_v2`);
      mapperCache.delete(`${streamName}_mapper`);
      
      // if (metricsEnabled) {
      //   console.log(`🧹 [AUTO-CLEANUP] Removed orphan stream: ${streamName}`);
      // }
    }
  });
  
  // if (cleaned > 0) {
  //   console.log(`🧹 [AUTO-CLEANUP] Removed ${cleaned} orphan streams: ${orphans.join(', ')}`);
  // }
  
  return cleaned;
};

// 🕐 LIMPEZA BASEADA EM TEMPO (STREAMS MUITO ANTIGAS)
export const cleanupOldStreams = (): number => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutos
  let cleaned = 0;
  
  // 🧹 Componentes muito antigos
  for (const [streamName, tracker] of componentStreams.entries()) {
    if (now - tracker.createdAt > maxAge) {
      componentStreams.delete(streamName);
      streamCache.delete(`${streamName}_v2`);
      mapperCache.delete(`${streamName}_mapper`);
      cleaned++;
      
      // if (metricsEnabled) {
      //   console.log(`🧹 [TIME-CLEANUP] Removed old component stream: ${streamName}`);
      // }
    }
  }
  
  // if (cleaned > 0) {
  //   console.log(`🧹 [TIME-CLEANUP] Removed ${cleaned} old component streams`);
  // }
  
  return cleaned;
};

// 🚨 LIMPEZA DE EMERGÊNCIA (MANUAL)
export const emergencyStreamCleanup = (): number => {
  const orphansCleaned = cleanupOrphanStreams();
  const oldCleaned = cleanupOldStreams();
  const total = orphansCleaned + oldCleaned;
  
  // console.log(`🚨 [EMERGENCY CLEANUP] Total cleaned: ${total} streams (${orphansCleaned} orphans + ${oldCleaned} old)`);
  
  return total;
};

// 🧭 LIMPEZA BASEADA EM NAVEGAÇÃO
let lastKnownPath = window.location.pathname;

export const cleanupOnNavigation = (): number => {
  const currentPath = window.location.pathname;
  
  if (currentPath !== lastKnownPath) {
    // console.log(`🧭 [NAVIGATION] ${lastKnownPath} → ${currentPath}`);
    
    let cleaned = 0;
    const streamsToRemove: string[] = [];
    
    // 🔍 Identificar streams da tela anterior que não são relevantes para a atual
    for (const [streamName, tracker] of componentStreams.entries()) {
      const isGlobalComponent = streamName.toLowerCase().includes('router') ||
                               streamName.toLowerCase().includes('notification') ||
                               streamName.toLowerCase().includes('auth');
      
      const isCurrentScreenComponent = currentPath.includes(streamName.toLowerCase());
      
      // 🗑️ Remover se não é global e não pertence à tela atual
      if (!isGlobalComponent && !isCurrentScreenComponent) {
        streamsToRemove.push(streamName);
      }
    }
    
    // 🧹 Executar limpeza
    streamsToRemove.forEach(streamName => {
      if (componentStreams.delete(streamName)) {
        streamCache.delete(`${streamName}_v2`);
        mapperCache.delete(`${streamName}_mapper`);
        cleaned++;
        
        if (metricsEnabled) {
          console.log(`🧭 [NAV-CLEANUP] Removed: ${streamName}`);
        }
      }
    });
    
    lastKnownPath = currentPath;
    
    if (cleaned > 0) {
      console.log(`🧭 [NAV-CLEANUP] Removed ${cleaned} streams from previous screen`);
    }
    
    return cleaned;
  }
  
  return 0;
};

// 🚨 LIMPEZA SUPER AGRESSIVA (PARA EMERGÊNCIAS)
export const aggressiveStreamCleanup = (): number => {
  const navCleaned = cleanupOnNavigation();
  const orphansCleaned = cleanupOrphanStreams();
  const oldCleaned = cleanupOldStreams();
  
  // 🔥 LIMPEZA ADICIONAL: Modais inativos há mais de 10 segundos
  let modalsCleaned = 0;
  const now = Date.now();
  
  for (const [streamName, tracker] of componentStreams.entries()) {
    if (streamName.toLowerCase().includes('modal')) {
      const inactiveSeconds = Math.floor((now - tracker.lastActivity) / 1000);
      if (inactiveSeconds >= 10) { // 10 segundos para modais
        if (componentStreams.delete(streamName)) {
          streamCache.delete(`${streamName}_v2`);
          mapperCache.delete(`${streamName}_mapper`);
          modalsCleaned++;
          
          if (metricsEnabled) {
            console.log(`🔥 [AGGRESSIVE] Removed modal: ${streamName} (inactive ${inactiveSeconds}s)`);
          }
        }
      }
    }
  }
  
  const total = navCleaned + orphansCleaned + oldCleaned + modalsCleaned;
  
  console.log(`🔥 [AGGRESSIVE CLEANUP] Total: ${total} (nav:${navCleaned}, orphans:${orphansCleaned}, old:${oldCleaned}, modals:${modalsCleaned})`);
  
  return total;
};

/**
 * 🛡️ LIMPEZA CONSERVADORA E SEGURA COM TEMPOS HÍBRIDOS
 */
export const safeStreamCleanup = (): number => {
  const now = Date.now();
  let cleaned = 0;
  const streamsToRemove: string[] = [];
  
  for (const [streamName, tracker] of componentStreams.entries()) {
    const ageMinutes = Math.floor((now - tracker.createdAt) / 60000);
    const inactiveMinutes = Math.floor((now - tracker.lastActivity) / 60000);
    
    // 🎯 TEMPOS HÍBRIDOS POR TIPO DE COMPONENTE
    let shouldRemove = false;
    const streamLower = streamName.toLowerCase();
    
    // 🔥 MODAIS: Mais agressivo (2 minutos)
    if (streamLower.includes('modal')) {
      if (inactiveMinutes >= 2) {
        // Verificação DOM extra para modais
        let elementExists = false;
        try {
          const modalSelectors = [`.modal`, `[class*="modal"]`, `[data-modal]`, `.${streamLower}`];
          elementExists = modalSelectors.some(sel => document.querySelector(sel));
        } catch (e) {
          elementExists = true; // Conservador em caso de erro
        }
        
        if (!elementExists) {
          shouldRemove = true;
          if (metricsEnabled) {
            console.log(`🔥 [MODAL-CLEANUP] ${streamName}: inactive=${inactiveMinutes}min, inDOM=${elementExists}`);
          }
        }
      }
    }
    
    // ⚡ COMPONENTES DE TELA: Médio (5 minutos)
    else if (streamLower.includes('tela') || streamLower.includes('page') || 
             ['contrato', 'loja', 'simulador'].some(screen => streamLower.includes(screen))) {
      if (ageMinutes >= 5 && inactiveMinutes >= 3) {
        // Verificar se não é a tela atual
        const currentPath = window.location.pathname.toLowerCase();
        const isCurrentScreen = currentPath.includes(streamLower) || streamLower.includes(currentPath.split('/').pop() || '');
        
        if (!isCurrentScreen) {
          shouldRemove = true;
          if (metricsEnabled) {
            console.log(`⚡ [SCREEN-CLEANUP] ${streamName}: age=${ageMinutes}min, inactive=${inactiveMinutes}min`);
          }
        }
      }
    }
    
    // 🌍 COMPONENTES GLOBAIS: Conservador (15 minutos)
    else if (streamLower.includes('router') || streamLower.includes('auth') || 
             streamLower.includes('notification') || streamLower.includes('header')) {
      if (ageMinutes >= 15 && inactiveMinutes >= 10) {
        shouldRemove = true;
        if (metricsEnabled) {
          console.log(`🌍 [GLOBAL-CLEANUP] ${streamName}: age=${ageMinutes}min (very old)`);
        }
      }
    }
    
    // 🔧 OUTROS COMPONENTES: Balanceado (7 minutos)
    else {
      if (ageMinutes >= 7 && inactiveMinutes >= 4) {
        shouldRemove = true;
        if (metricsEnabled) {
          console.log(`🔧 [COMPONENT-CLEANUP] ${streamName}: age=${ageMinutes}min, inactive=${inactiveMinutes}min`);
        }
      }
    }
    
    if (shouldRemove) {
      streamsToRemove.push(streamName);
    }
  }
  
  // 🧹 Executar limpeza
  if (streamsToRemove.length > 0) {
    streamsToRemove.forEach(streamName => {
      if (componentStreams.delete(streamName)) {
        streamCache.delete(`${streamName}_v2`);
        mapperCache.delete(`${streamName}_mapper`);
        cleaned++;
      }
    });
    
    console.log(`🛡️ [HYBRID-CLEANUP] Removed ${cleaned} streams with smart timing`);
  }
  
  return cleaned;
};

/**
 * 📊 MONITORAMENTO SEM LIMPEZA (APENAS DIAGNÓSTICO)
 */
export const monitorStreamHealth = () => {
  const now = Date.now();
  const stats = {
    totalStreams: componentStreams.size,
    modals: 0,
    screens: 0,
    globals: 0,
    others: 0,
    criticalStreams: [] as string[],
    warnStreams: [] as string[]
  };
  
  for (const [streamName, tracker] of componentStreams.entries()) {
    const ageMinutes = Math.floor((now - tracker.createdAt) / 60000);
    const inactiveMinutes = Math.floor((now - tracker.lastActivity) / 60000);
    const streamLower = streamName.toLowerCase();
    
    // 📊 Categorizar por tipo
    if (streamLower.includes('modal')) {
      stats.modals++;
      // 🚨 Modal inativo há mais de 3 minutos é crítico
      if (inactiveMinutes >= 3) {
        stats.criticalStreams.push(`${streamName} (modal, inactive ${inactiveMinutes}min)`);
      }
    }
    else if (streamLower.includes('tela') || streamLower.includes('page') || 
             ['contrato', 'loja', 'simulador'].some(screen => streamLower.includes(screen))) {
      stats.screens++;
      // ⚠️ Tela antiga há mais de 7 minutos é suspeita
      if (ageMinutes >= 7) {
        stats.warnStreams.push(`${streamName} (screen, age ${ageMinutes}min)`);
      }
    }
    else if (streamLower.includes('router') || streamLower.includes('auth') || 
             streamLower.includes('notification') || streamLower.includes('header')) {
      stats.globals++;
      // 🌍 Global muito antigo (>20min) é suspeito
      if (ageMinutes >= 20) {
        stats.warnStreams.push(`${streamName} (global, age ${ageMinutes}min)`);
      }
    }
    else {
      stats.others++;
      // 🔧 Outros componentes antigos (>10min) são suspeitos
      if (ageMinutes >= 10) {
        stats.warnStreams.push(`${streamName} (component, age ${ageMinutes}min)`);
      }
    }
  }
  
  return stats;
};

// 🌍 EXPOR FUNÇÕES GLOBALMENTE PARA DEBUG
if (typeof window !== 'undefined') {
  (window as any).getStreamStats = getStreamStats;
  (window as any).logStreamStats = logStreamStats;
  (window as any).getCompleteSystemStats = getCompleteSystemStats;
  (window as any).logCompleteSystemStats = logCompleteSystemStats;
  (window as any).clearStreamCache = clearStreamCache;
  (window as any).cleanupOrphanStreams = cleanupOrphanStreams;
  (window as any).cleanupOldStreams = cleanupOldStreams;
  (window as any).emergencyStreamCleanup = emergencyStreamCleanup;
  (window as any).cleanupOnNavigation = cleanupOnNavigation;
  
//   console.log('🌍 [STREAM FACTORY] Funções de debug expostas globalmente:');
//   console.log('  - getStreamStats()');
//   console.log('  - logStreamStats()');
//   console.log('  - getCompleteSystemStats()');
//   console.log('  - logCompleteSystemStats()');
//   console.log('  - clearStreamCache()');
//   console.log('  - cleanupOrphanStreams()');
//   console.log('  - emergencyStreamCleanup()');
//   console.log('  - cleanupOnNavigation()');
// }
}