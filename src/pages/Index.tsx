import { useState, useEffect } from 'react';
import { Layout, Typography, Space, message } from 'antd';
import { FilterSection, FilterState } from '@/components/analytics/FilterSection';
import { IndicadoresScreen, KPISection } from '@/components/analytics/KPISection';
import { FunctionalityChart } from '@/components/analytics/FunctionalityChart';
import { FunctionalityRanking } from '@/components/analytics/FunctionalityRanking';
import { RetailRanking } from '@/components/analytics/RetailRanking';
import { UserTypeRanking } from '@/components/analytics/UserTypeRanking';

import { TimelineChart } from '@/components/analytics/TimelineChart';
import { UserTable } from '@/components/analytics/UserTable';
import { DrilldownModal } from '@/components/analytics/DrilldownModal';
import { ActiveUsersModal } from '@/components/analytics/ActiveUsersModal';
import { NPSModal } from '@/components/analytics/NPSModal';
import { AccessModal } from '@/components/analytics/AccessModal';
import { FunctionalityModal } from '@/components/analytics/FunctionalityModal';
import { RetailModal } from '@/components/analytics/RetailModal';
import {
  generateMockUsers,
  generateFunctionalityData,
  
  generateTimelineData,
  generateKPIData,
  generateRetailData,
  generateVarejoRankingData,
  generateIndustriaRankingData,
  generatePhotocheckRankingData,
  generateDrilldownData,
  generateActiveUsersData,
  UserData
} from '@/utils/mockData';

const { Content } = Layout;
const { Title, Text } = Typography;

const Index = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState<FilterState>({
    dataInicio: new Date(),
    dataFim: new Date(),
    funcionalidade: [],
    varejo: [],
    Nps: [],
    PeriodosRapidos: []
  });
  
  const [drilldownModal, setDrilldownModal] = useState<{
    isOpen: boolean;
    functionality: string;
    users: any[];
  }>({
    isOpen: false,
    functionality: '',
    users: []
  });

  const [activeUsersModal, setActiveUsersModal] = useState<{
    isOpen: boolean;
    users: any[];
  }>({
    isOpen: false,
    users: []
  });

  const [npsModal, setNPSModal] = useState(false);
  const [accessModal, setAccessModal] = useState(false);
  const [functionalityModal, setFunctionalityModal] = useState(false);
  const [retailModal, setRetailModal] = useState(false);

  // Mock data
  const [userData] = useState<UserData[]>(() => generateMockUsers(150));
  const [functionalityData] = useState(() => generateFunctionalityData());
  
  const [timelineData] = useState(() => generateTimelineData());
  const [kpiData] = useState(() => generateKPIData());
  const [retailData] = useState(() => generateRetailData());
  const [varejoRankingData] = useState(() => generateVarejoRankingData());
  const [industriaRankingData] = useState(() => generateIndustriaRankingData());
  const [photocheckRankingData] = useState(() => generatePhotocheckRankingData());

  const handleExportCSV = () => {
    messageApi.success('Os dados filtrados estão sendo exportados para CSV.');
  };

  const handleExportTable = () => {
    messageApi.success('A tabela de usuários foi exportada com sucesso.');
  };

  const handleFunctionalityDrilldown = (functionality: string) => {
    const drilldownUsers = generateDrilldownData(functionality);
    setDrilldownModal({
      isOpen: true,
      functionality,
      users: drilldownUsers
    });
  };

  const handleDrilldownExport = () => {
    messageApi.success(`Dados da funcionalidade ${drilldownModal.functionality} exportados.`);
  };


  const handleActiveUsersExport = () => {
    messageApi.success('Dados dos usuários ativos exportados.');
  };

  useEffect(() => {
    // Set default date range to last 30 days
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    
    setFilters(prev => ({
      ...prev,
      dataInicio: from,
      dataFim: to
    }));
    
    // Listen for parent URL message
    const handleMessage = (event: MessageEvent) => {
      if (event.origin.includes("meucliente.app.br") && event.data?.parentUrl) {
        console.log("URL do pai recebida:", event.data.parentUrl);
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    // Request parent URL
    window.parent.postMessage({ type: "REQUEST_PARENT_URL" }, "*");
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {contextHolder}
      
      {/* Header */}
      <div style={{ 
        background: '#07395F', 
        padding: '16px 24px',
        boxShadow: '0 4px 20px rgba(7, 57, 95, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        display: 'none'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(20px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(15px)'
        }} />
        
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <Title level={1} style={{ 
            color: 'white',
            margin: 0,
            fontSize: '28px',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            letterSpacing: '-0.025em'
          }}>
            Meu Cliente
          </Title>
        </div>
      </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Space direction="vertical" size={32} style={{ width: '100%' }}>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <IndicadoresScreen/>
            </div> 
            {/* Drilldown Modal */}
            <DrilldownModal
              isOpen={drilldownModal.isOpen}
              onClose={() => setDrilldownModal(prev => ({ ...prev, isOpen: false }))}
              functionality={drilldownModal.functionality}
              users={drilldownModal.users}
              onExport={handleDrilldownExport}
            />
          </Space>
        </div>
    </Layout>
  );
};

export default Index;