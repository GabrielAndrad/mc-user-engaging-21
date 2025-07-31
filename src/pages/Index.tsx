import { useState, useEffect } from 'react';
import { Layout, Typography, Space, message } from 'antd';
import { FilterSection, FilterState } from '@/components/analytics/FilterSection';
import { KPISection } from '@/components/analytics/KPISection';
import { FunctionalityChart } from '@/components/analytics/FunctionalityChart';
import { FunctionalityRanking } from '@/components/analytics/FunctionalityRanking';
import { RetailRanking } from '@/components/analytics/RetailRanking';
import { UserTypeRanking } from '@/components/analytics/UserTypeRanking';

import { TimelineChart } from '@/components/analytics/TimelineChart';
import { UserTable } from '@/components/analytics/UserTable';
import { DrilldownModal } from '@/components/analytics/DrilldownModal';
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
  UserData
} from '@/utils/mockData';

const { Content } = Layout;
const { Title, Text } = Typography;

const Index = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    userTypes: [],
    functionality: '',
    account: '',
    nps: ''
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

  useEffect(() => {
    // Set default date range to last 30 days
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to }
    }));
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

      {/* Navigation Tabs */}
      <div style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex',
            gap: '32px',
            paddingTop: '20px',
            paddingBottom: '4px'
          }}>
            <div style={{
              padding: '12px 0',
              borderBottom: '3px solid #3b82f6',
              color: '#1e40af',
              fontWeight: 600,
              fontSize: '16px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Engajamento da Plataforma
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '0',
                right: '0',
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: '2px 2px 0 0'
              }} />
            </div>
          </div>
        </div>
      </div>

      <Content style={{ 
        padding: '32px 24px',
        backgroundColor: '#f8fafc',
        minHeight: 'calc(100vh - 140px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Space direction="vertical" size={32} style={{ width: '100%' }}>


            {/* Filters */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <FilterSection
                filters={filters}
                onFiltersChange={setFilters}
                onExport={handleExportCSV}
              />
            </div>

            {/* KPIs */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <KPISection data={kpiData} />
            </div>

            {/* Functionality Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <FunctionalityChart
                data={functionalityData}
                onDrilldown={handleFunctionalityDrilldown}
              />
            </div>

            {/* Timeline Chart - Full Width */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <TimelineChart data={timelineData} />
            </div>

            {/* Functionality Rankings */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <FunctionalityRanking data={functionalityData} />
            </div>


            {/* User Type Rankings */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <UserTypeRanking 
                varejoData={varejoRankingData} 
                industriaData={industriaRankingData}
                photocheckData={photocheckRankingData}
              />
            </div>

            {/* Users Table */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden'
            }}>
              <UserTable
                data={userData}
                onExport={handleExportTable}
              />
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
      </Content>
    </Layout>
  );
};

export default Index;