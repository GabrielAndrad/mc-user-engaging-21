// Mock data generator for the analytics dashboard

export interface UserData {
  id: string;
  name: string;
  email: string;
  account: string;
  type: 'varejo' | 'industria' | 'photocheck';
  functionality: string;
  totalAccess: number;
  totalTime: number;
  averageTime: number;
  lastAccess: string;
  nps: number;
  npsCategory: 'promotores' | 'neutros' | 'detratores';
}

export interface FunctionalityData {
  name: string;
  acessos: number;
  tempoMedio: number;
  percentualUsuarios: number;
}

export interface UserTypeData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TimelineData {
  date: string;
  acessos: number;
  varejo: number;
  industria: number;
  photocheck: number;
}

export interface KPIData {
  totalActiveUsers: number;
  activeUsersPercentage: number;
  averageSessionTime: number;
  topFunctionality: string;
  topAccount: string;
  totalUsers: number;
  npsScore: number;
}

export interface RetailData {
  id: string;
  name: string;
  totalAccess: number;
  averageTime: number;
  userPercentage: number;
  engagementScore: number;
  growth: number;
}

export interface UserTypeRankingData {
  id: string;
  name: string;
  totalAccess: number;
  averageTime: number;
  engagementScore: number;
  growth: number;
  userCount: number;
}

const FUNCTIONALITIES = [
  'PhotoCheck',
  'JBP',
  'ROI',
  'Sell-Out',
  'Painel de Indicadores',
  'Cadastro de Loja',
  'Análise de Vendas'
];

const ACCOUNTS = [
  'Supermercado Extra',
  'Carrefour',
  'Pão de Açúcar',
  'Big Bompreço',
  'Walmart',
  'Atacadão',
  'Sam\'s Club',
  'BJ\'s',
  'Makro',
  'Assaí'
];

const NAMES = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Pereira',
  'Juliana Lima',
  'Roberto Alves',
  'Fernanda Rodrigues',
  'Lucas Martins',
  'Camila Fernandes'
];

// Generate random date within last 30 days
const getRandomDate = () => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('pt-BR');
};

// Generate mock user data
export const generateMockUsers = (count: number = 100): UserData[] => {
  return Array.from({ length: count }, (_, index) => {
    const types: ('varejo' | 'industria' | 'photocheck')[] = ['varejo', 'industria', 'photocheck'];
    const type = types[Math.floor(Math.random() * types.length)];
    const functionality = FUNCTIONALITIES[Math.floor(Math.random() * FUNCTIONALITIES.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)];
    const nps = Math.floor(Math.random() * 11); // 0-10
    
    let npsCategory: 'promotores' | 'neutros' | 'detratores';
    if (nps >= 9) npsCategory = 'promotores';
    else if (nps >= 7) npsCategory = 'neutros';
    else npsCategory = 'detratores';
    
    return {
      id: `user-${index + 1}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@${account.toLowerCase().replace(' ', '')}.com.br`,
      account,
      type,
      functionality,
      totalAccess: Math.floor(Math.random() * 50) + 1,
      totalTime: Math.floor(Math.random() * 300) + 30,
      averageTime: Math.floor(Math.random() * 60) + 5,
      lastAccess: getRandomDate(),
      nps,
      npsCategory
    };
  });
};

// Generate functionality usage data
export const generateFunctionalityData = (): FunctionalityData[] => {
  return FUNCTIONALITIES.map(name => ({
    name,
    acessos: Math.floor(Math.random() * 500) + 50,
    tempoMedio: Math.floor(Math.random() * 45) + 5,
    percentualUsuarios: Math.floor(Math.random() * 80) + 20
  }));
};

// Generate user type distribution
export const generateUserTypeData = (): UserTypeData[] => {
  const total = 1000;
  const varejo = Math.floor(total * 0.6);
  const industria = Math.floor(total * 0.25);
  const photocheck = total - varejo - industria;

  return [
    {
      name: 'Varejo',
      value: varejo,
      percentage: Math.round((varejo / total) * 100),
      color: 'hsl(235, 89%, 65%)'
    },
    {
      name: 'Indústria',
      value: industria,
      percentage: Math.round((industria / total) * 100),
      color: 'hsl(270, 70%, 70%)'
    },
    {
      name: 'PhotoCheck',
      value: photocheck,
      percentage: Math.round((photocheck / total) * 100),
      color: 'hsl(142, 76%, 55%)'
    }
  ];
};

// Generate timeline data for last 30 days
export const generateTimelineData = (): TimelineData[] => {
  const data: TimelineData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const varejo = Math.floor(Math.random() * 100) + 20;
    const industria = Math.floor(Math.random() * 50) + 10;
    const photocheck = Math.floor(Math.random() * 30) + 5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      acessos: varejo + industria + photocheck,
      varejo,
      industria,
      photocheck
    });
  }
  
  return data;
};

// Generate KPI data
export const generateKPIData = (): KPIData => {
  const totalUsers = 1500;
  const activeUsers = Math.floor(totalUsers * 0.75);
  
  return {
    totalActiveUsers: activeUsers,
    activeUsersPercentage: Math.round((activeUsers / totalUsers) * 100),
    averageSessionTime: 23,
    topFunctionality: 'PhotoCheck',
    topAccount: 'Supermercado Extra',
    totalUsers,
    npsScore: 67
  };
};

// Generate retail ranking data
export const generateRetailData = (): RetailData[] => {
  return ACCOUNTS.map((name, index) => {
    const totalAccess = Math.floor(Math.random() * 1000) + 100;
    const averageTime = Math.floor(Math.random() * 60) + 10;
    const userPercentage = Math.floor(Math.random() * 80) + 20;
    const engagementScore = Math.floor(Math.random() * 100) + 1;
    const growth = Math.floor(Math.random() * 40) - 20; // -20% to +20%
    
    return {
      id: `retail-${index + 1}`,
      name,
      totalAccess,
      averageTime,
      userPercentage,
      engagementScore,
      growth
    };
  });
};

// Generate active users data
export const generateActiveUsersData = () => {
  const userCount = Math.floor(Math.random() * 50) + 30;
  
  return Array.from({ length: userCount }, (_, index) => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)];
    const functionality = FUNCTIONALITIES[Math.floor(Math.random() * FUNCTIONALITIES.length)];
    
    return {
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@${account.toLowerCase().replace(' ', '')}.com.br`,
      account,
      functionality,
      totalAccess: Math.floor(Math.random() * 100) + 10,
      totalTime: Math.floor(Math.random() * 500) + 30, // em minutos
      averageTime: Math.floor(Math.random() * 45) + 5, // em minutos
      lastAccess: getRandomDate()
    };
  });
};

// Generate drilldown data for a specific functionality
export const generateDrilldownData = (functionality: string) => {
  const userCount = Math.floor(Math.random() * 20) + 5;
  const types: ('varejo' | 'industria' | 'photocheck')[] = ['varejo', 'industria', 'photocheck'];
  
  return Array.from({ length: userCount }, (_, index) => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)];
    
    return {
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@${account.toLowerCase().replace(' ', '')}.com.br`,
      type,
      account,
      totalTime: Math.floor(Math.random() * 200) + 30,
      averageTime: Math.floor(Math.random() * 45) + 10,
      sessions: Math.floor(Math.random() * 20) + 3,
      lastAccess: getRandomDate()
    };
  });
};

// Generate detailed ranking data for user types
export const generateVarejoRankingData = () => {
  return ACCOUNTS.map((name, index) => {
    const totalAccess = Math.floor(Math.random() * 1500) + 200;
    const averageTime = Math.floor(Math.random() * 60) + 10;
    const engagementScore = Math.floor(Math.random() * 100) + 1;
    const growth = Math.floor(Math.random() * 40) - 20;
    const userCount = Math.floor(Math.random() * 100) + 10;
    
    return {
      id: `varejo-${index + 1}`,
      name,
      totalAccess,
      averageTime,
      engagementScore,
      growth,
      userCount,
      segment: 'Varejo'
    };
  });
};

export const generateIndustriaRankingData = () => {
  const industrias = [
    'Nestlé Brasil',
    'Unilever',
    'Coca-Cola Brasil',
    'Ambev',
    'JBS',
    'BRF',
    'Kimberly-Clark',
    'Mondelez Brasil',
    'Danone',
    'General Mills'
  ];
  
  return industrias.map((name, index) => {
    const totalAccess = Math.floor(Math.random() * 1200) + 150;
    const averageTime = Math.floor(Math.random() * 45) + 15;
    const engagementScore = Math.floor(Math.random() * 100) + 1;
    const growth = Math.floor(Math.random() * 40) - 20;
    const userCount = Math.floor(Math.random() * 80) + 5;
    
    return {
      id: `industria-${index + 1}`,
      name,
      totalAccess,
      averageTime,
      engagementScore,
      growth,
      userCount,
      segment: 'Indústria'
    };
  });
};

export const generatePhotocheckRankingData = () => {
  // PhotoCheck mostra varejos que usam esta funcionalidade
  const photocheckVarejos = ACCOUNTS.slice(0, 7); // Apenas alguns varejos usam PhotoCheck
  
  return photocheckVarejos.map((name, index) => {
    const totalAccess = Math.floor(Math.random() * 800) + 50;
    const averageTime = Math.floor(Math.random() * 30) + 5;
    const engagementScore = Math.floor(Math.random() * 100) + 1;
    const growth = Math.floor(Math.random() * 40) - 20;
    const userCount = Math.floor(Math.random() * 50) + 3;
    
    return {
      id: `photocheck-${index + 1}`,
      name,
      totalAccess,
      averageTime,
      engagementScore,
      growth,
      userCount,
      segment: 'PhotoCheck'
    };
  });
};