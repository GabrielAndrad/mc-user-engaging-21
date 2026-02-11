import { Card, Row, Col, Statistic, Typography, Spin, message } from 'antd';
import {
  UserOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  TrophyOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons';
import { createSafeStream } from '@/utils/stream-factory';
import { EvolucaoDiaria, IndicadoresState, LoadComboMenu, LoadIndicadoresEngajamento, LoadIndicadoresAll, openCloseActiveUsersModal, openCloseFuncionalidadeMaisAcessada, openCloseMediaAcesso, openCloseNpsModal, openCloseVarejoMaisEngajado, RankingVarejo, updateValuesFilters, UtilizacaoPorFuncionalidade } from '@/Stores/Indicadores-store';
import { plug } from 'luffie';
import React, { useState } from 'react';
import { FunctionalityData, generateActiveUsersData, generateDrilldownData, TimelineData } from '@/utils/mockData';
import { ActiveUsersModal } from './ActiveUsersModal';
import { NpsDetalhes } from '@/interface/Nps';
import { NPSModal } from './NPSModal';
import { UsuarioAtivoEngajamento } from '@/interface/UsuariosAtivos';
import { RetailModal } from './RetailModal';
import { VarejoMaisEngajado } from '@/interface/VarejoMaisEngajado';
import { AccessModal } from './AccessModal';
import { MediaAcessos } from '@/interface/mediaAcessos';
import { FunctionalityModal } from './FunctionalityModal';
import { MaisAcessada } from '@/interface/MaisAcessado';
import { FunctionalityChart } from './FunctionalityChart';
import { TimelineChart } from './TimelineChart';
import { FunctionalityRanking } from './FunctionalityRanking';
import { UserTypeRanking } from './UserTypeRanking';
import { UserTable } from './UserTable';
import { FilterSection } from './FilterSection';
import { OperationalMetrics, OperationalMetricsData } from './OperationalMetrics';
import { LoadIndicadores } from '@/services/Indicadores-service';
import { exportDashboardData } from '@/utils/excelExport';
import { 
  createUserTableExportHandler,
  createNPSExportHandler, 
  createAccessExportHandler,
  createRetailExportHandler,
  createFunctionalityExportHandler
} from '@/utils/modalExportHandlers';

const { Text } = Typography;

interface KPIData {
  totalActiveUsers: number;
  activeUsersPercentage: number;
  averageSessionTime: number;
  topFunctionality: string;
  topAccount: string;
  totalUsers: number;
  AcessMedia: number;
  npsScore: number;
}

interface KPISectionProps {
  data: KPIData;
  Isloading: boolean;
  OpenActiveUsersModal: boolean;
  OpenNpsModal: boolean;
  DataNpsDetalhes: NpsDetalhes;
  DataUsuariosAtivosDetalhes: UsuarioAtivoEngajamento[];
  OpenVarejoMaisEngajado: boolean;
  DataVarejoMaisEngajado: VarejoMaisEngajado,
  DataUtilizacaoPorFuncionalidade: any,
  DataEvolucaoDiaria: any,
  DataRankingVarejo: any,
  DataMediaAcessos: MediaAcessos,
  OpenMediaAcesso: boolean;
  DataMaisAcessada: MaisAcessada,
  OpenMaisAcessada: false,
  ValuesFilters: any,
  Combos: any,
  IsloadingIndicadores?: boolean;
  IsloadingEvolucaoDiaria?: boolean;
  loadingNps?: boolean;
  loadingMediaAcessos?: boolean;
  IsloadingUtilizacaoPorFuncionalidade?: boolean;
  IsloadingUsuariosAtivosDetalhes: boolean;
  IsloadingRankingVarejo: boolean;
  loadingVarejoMaisEngajado?: boolean;
}

export const KPISection: React.FC<KPISectionProps> = ({
  data,
  Isloading,
  IsloadingIndicadores,
  OpenActiveUsersModal,
  DataNpsDetalhes,
  OpenNpsModal,
  DataUsuariosAtivosDetalhes,
  OpenVarejoMaisEngajado,
  DataVarejoMaisEngajado,
  DataMediaAcessos,
  OpenMediaAcesso,
  DataMaisAcessada,
  OpenMaisAcessada,
  DataUtilizacaoPorFuncionalidade,
  DataEvolucaoDiaria,
  DataRankingVarejo,
  ValuesFilters,
  Combos,
  IsloadingRankingVarejo,
  IsloadingUsuariosAtivosDetalhes,
  IsloadingEvolucaoDiaria,
  IsloadingUtilizacaoPorFuncionalidade,
}) => {

  const handleExportDashboard = () => {
    try {
      // Mock data for dashboard export - in real app, this would use actual data
      const mockKpiData = {
        totalActiveUsers: DataUsuariosAtivosDetalhes?.length || 0,
        activeUsersPercentage: 75,
        averageSessionTime: 23,
        topFunctionality: DataMaisAcessada?.MaisAcessada || 'PhotoCheck',
        topAccount: data.topAccount,
        npsScore: DataNpsDetalhes?.npsScore || 67,
        totalUsers: 1500
      };
      
      const mockFunctionalityData = DataMaisAcessada ? [{
        name: DataMaisAcessada.MaisAcessada || 'Funcionalidade',
        acessos: DataMaisAcessada.TotalAcessos || 0,
        tempoMedio: 25,
        percentualUsuarios: 65
      }] : [];
      
      const mockTimelineData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        acessos: Math.floor(Math.random() * 100) + 50,
        varejo: Math.floor(Math.random() * 50) + 20,
        industria: Math.floor(Math.random() * 30) + 10,
        photocheck: Math.floor(Math.random() * 20) + 5
      }));
      
      const mockRetailData = DataVarejoMaisEngajado ? [{
        name: data.topAccount,
        totalAccess: DataVarejoMaisEngajado.TotalUsuarios || 0,
        averageTime: 25,
        userPercentage: 65,
        engagementScore: DataVarejoMaisEngajado.TaxaEngajamento || 0,
        growth: 15
      }] : [];
      
      exportDashboardData(mockKpiData, mockFunctionalityData, mockTimelineData, mockRetailData);
      message.success('Dashboard exportado para Excel com sucesso!');
    } catch (error) {
      message.error('Erro ao exportar dados do dashboard.');
    }
  };

  const kpis = [
    {
      title: 'Usuários ativos',
      value: `${data.totalActiveUsers ?? 0} (${data.activeUsersPercentage ?? 0}%) de ${(data.totalUsers ?? 0).toLocaleString()}`,
      description: 'da base total',
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      backgroundColor: '#e6f7ff',
      borderColor: '#1890ff',
      iconBackgroundColor: '#f0f8ff',
      isText: true
    },
    {
      title: 'NPS Score',
      value: data && data.npsScore,
      description: 'índice de satisfação',
      icon: <StarOutlined style={{ color: '#722ed1' }} />,
      backgroundColor: '#f9f0ff',
      borderColor: '#722ed1',
      iconBackgroundColor: '#fcf8ff',
    },
    {
      title: 'Média de Acessos',
      value: Math.round(data.AcessMedia),
      suffix: '',
      description: 'média no período',
      icon: <BarChartOutlined style={{ color: '#eb2f96' }} />,
      backgroundColor: '#fff0f6',
      borderColor: '#eb2f96',
      iconBackgroundColor: '#fffafc',
    },
    {
      title: 'Funcionalidade mais acessada',
      value: data.topFunctionality,
      description: 'maior engajamento',
      icon: <TrophyOutlined style={{ color: '#1890ff' }} />,
      backgroundColor: '#e6f7ff',
      borderColor: '#1890ff',
      iconBackgroundColor: '#f0f8ff',
      isText: true
    },
    {
      title: 'Varejo mais engajado',
      value: data.topAccount,
      description: 'maior uso médio',
      icon: <CrownOutlined style={{ color: '#722ed1' }} />,
      backgroundColor: '#f9f0ff',
      borderColor: '#722ed1',
      iconBackgroundColor: '#fcf8ff',
      isText: true
    }
  ];

  const chartData: FunctionalityData[] = DataUtilizacaoPorFuncionalidade.map(item => ({
    name: item.Name,
    acessos: item.Acessos,
    tempoMedio: item.TempoMedio,
    percentualUsuarios: item.PercentualUsuarios
  }));

  const chartDataEvolucaoDiaria = DataEvolucaoDiaria.map(item => ({
    date: item.Data,
    acessos: item.TotalAcessos,
    usuariosUnicos: item.UsuariosUnicos,
    DiaSemana: item.DiaSemana
  }));

  return (
    <div>
      <FilterSection
        ValuesFilters={ValuesFilters}
        onFiltersChange={updateValuesFilters}
        onExport={handleExportDashboard}
        Combos={Combos}
      />
      <Spin spinning={IsloadingIndicadores}>
        <Row gutter={[12, 16]} justify="space-between" style={{ marginBottom: '12px',marginTop:'20px',padding: '0 12px' }}>
          {kpis.map((kpi, index) => (
            <Col flex="1" style={{ maxWidth: '19%' }} key={index}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #f1f5f9',
                overflow: 'hidden'
              }}>
              </div>
              <Card
                style={{
                  backgroundColor: kpi.backgroundColor,
                  border: `2px solid ${kpi.borderColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  height: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '20px', textAlign: 'center', position: 'relative', zIndex: 1 }}
                onClick={() => {
                  if (index === 0) openCloseActiveUsersModal(true);
                  else if (index === 1) openCloseNpsModal(true);
                  else if (index === 2) openCloseMediaAcesso(true);
                  else if (index === 3) openCloseFuncionalidadeMaisAcessada(true);
                  else if (index === 4) openCloseVarejoMaisEngajado(true);
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '32px',
                  height: '32px',
                  backgroundColor: kpi.iconBackgroundColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  {kpi.icon}
                </div>

                <div style={{ color: '#595959', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
                  {kpi.title}
                </div>

                {kpi.isText ? (
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#262626',
                    lineHeight: '1.3',
                    marginBottom: '8px'
                  }}>
                    {kpi.value}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: kpi.borderColor,
                    marginBottom: '8px'
                  }}>
                    {kpi.value}{kpi.suffix}
                  </div>
                )}

                {kpi.description && (
                  <div style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginTop: 'auto'
                  }}>
                    {kpi.description}
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* Operational Metrics */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        <OperationalMetrics data={{
          contratos: 1245,
          execucoes: 8732,
          produtos: 3891,
          tarefas: 5620,
          inventariosAlterados: 947,
          fluxoPagamento: 2314,
        }} />
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#8c8c8c',
        marginBottom: '24px',
        padding: '0 12px'
      }}>
        💡 Clique no card para os detalhes da geração do indicador
      </div>
      <Spin spinning={IsloadingUtilizacaoPorFuncionalidade}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <FunctionalityChart
            data={chartData}
            onDrilldown={() => { }}
          />
        </div>
      </Spin>
      <Spin spinning={IsloadingEvolucaoDiaria}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <TimelineChart data={chartDataEvolucaoDiaria} />
        </div>
      </Spin>
      <Spin spinning={IsloadingRankingVarejo}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <FunctionalityRanking data={chartData} />
        </div>
      </Spin>
      <Spin spinning={IsloadingUtilizacaoPorFuncionalidade}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <UserTypeRanking
            varejoData={DataRankingVarejo && DataRankingVarejo.DataVarejo ? DataRankingVarejo.DataVarejo : []}
            industriaData={null}
            photocheckData={null}
          />
        </div>
      </Spin>
      <Spin spinning={IsloadingUsuariosAtivosDetalhes}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <UserTable
            data={DataUsuariosAtivosDetalhes}
            comboFuncionalidade={Combos && Combos.funcionalidade}
            onExport={createUserTableExportHandler(DataUsuariosAtivosDetalhes)}
          />
        </div>
      </Spin>

      <ActiveUsersModal
        isOpen={OpenActiveUsersModal}
        onClose={() => openCloseActiveUsersModal(false)}
        users={DataUsuariosAtivosDetalhes}
            onExport={createUserTableExportHandler(DataUsuariosAtivosDetalhes)}
      />
      <NPSModal
        isOpen={OpenNpsModal}
        onClose={() => openCloseNpsModal(false)}
        npsDetails={DataNpsDetalhes}
        onExport={createNPSExportHandler(DataNpsDetalhes)}
      />

      <RetailModal
        isOpen={OpenVarejoMaisEngajado}
        onClose={() => openCloseVarejoMaisEngajado(false)}
        retailName={{ ...DataVarejoMaisEngajado, VarejoName: data.topAccount }}
        onExport={createRetailExportHandler(data.topAccount)}
      />

      <AccessModal
        isOpen={OpenMediaAcesso}
        onClose={() => openCloseMediaAcesso(false)}
        averageAccess={Math.round(DataMediaAcessos && DataMediaAcessos.UsuariosUnicos * 1.5)}
        onExport={createAccessExportHandler(DataMediaAcessos)}
        DataMediaAcessos={DataMediaAcessos}
      />

      <FunctionalityModal
        isOpen={OpenMaisAcessada}
        onClose={() => openCloseFuncionalidadeMaisAcessada(false)}
        functionality={DataMaisAcessada}
        onExport={createFunctionalityExportHandler(DataMaisAcessada)}
      />
    </div>
  );
}

const stream = (props: any) => {
  return createSafeStream({
    streamName: 'CentroCusto',

    // ✅ CARREGADORES INICIAIS
    initialLoaders: [
      () => {
        LoadIndicadoresAll()
      }
    ],

    // ✅ STORES PARA COMBINAR
    stores: [
      IndicadoresState
    ],

    // ✅ MAPPER CUSTOMIZADO
    mapper: ([Indicadores]) => {
      // ✅ SEGURANÇA: Verificar se estado está definido
      const safeIndicadores = Indicadores || {};

      // Aqui, extraímos os loadings individuais da store, se existirem
      return {
        ...safeIndicadores,
      };
    },

    // ✅ CONFIGURAÇÕES CUSTOMIZADAS
    cacheDuration: 120000, // 2 minutos para centro de custo (dados estáveis)
    debounceDelay: 50,    // Delay padrão

    // ✅ CALLBACKS CUSTOMIZADOS
    onError: (error) => {
      console.error('💰 [IndicadoresStream] Erro crítico:', error);
      // Em caso de erro, tentar recarregar dados básicos
      try {
        LoadIndicadoresAll();
      } catch (reloadError) {
        console.error('💰 [IndicadoresStream] Falha ao recarregar centro de custo:', reloadError);
      }
    },

    onCleanup: () => {
      console.log('💰 [IndicadoresStream] Cleanup customizado executado');
      // ✅ CLEANUP: Fechar formulários se necessário
    }
  });
};

export const IndicadoresScreen = plug(stream)(KPISection);