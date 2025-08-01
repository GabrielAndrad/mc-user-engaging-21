import { Card, Row, Col, Statistic, Typography } from 'antd';
import { 
  UserOutlined, 
  ThunderboltOutlined, 
  BarChartOutlined, 
  TrophyOutlined,
  CrownOutlined,
  StarOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

interface KPIData {
  totalActiveUsers: number;
  activeUsersPercentage: number;
  averageSessionTime: number;
  topFunctionality: string;
  topAccount: string;
  totalUsers: number;
  npsScore: number;
}

interface KPISectionProps {
  data: KPIData;
  onActiveUsersClick?: () => void;
  onNPSClick?: () => void;
  onAccessClick?: () => void;
  onFunctionalityClick?: () => void;
  onRetailClick?: () => void;
}

export function KPISection({ data, onActiveUsersClick, onNPSClick, onAccessClick, onFunctionalityClick, onRetailClick }: KPISectionProps) {
  const kpis = [
     {
      title: 'Usuários ativos',
      value: `${data.totalActiveUsers} (${data.activeUsersPercentage}%) de ${data.totalUsers.toLocaleString()}`,
      description: 'da base total',
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      backgroundColor: '#e6f7ff',
      borderColor: '#1890ff',
      iconBackgroundColor: '#f0f8ff',
      isText: true
    },
    {
      title: 'NPS Score',
      value: data.npsScore,
      description: 'índice de satisfação',
      icon: <StarOutlined style={{ color: '#722ed1' }} />,
      backgroundColor: '#f9f0ff',
      borderColor: '#722ed1',
      iconBackgroundColor: '#fcf8ff',
    },
    {
      title: 'Média de Acessos',
      value: Math.round(data.totalActiveUsers * 1.5),
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

  return (
    <div>
      <Row gutter={[12, 16]} justify="space-between" style={{ marginBottom: '12px', padding: '0 12px' }}>
         {kpis.map((kpi, index) => (
          <Col flex="1" style={{ maxWidth: '19%' }} key={index}>
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
                if (index === 0 && onActiveUsersClick) onActiveUsersClick();
                else if (index === 1 && onNPSClick) onNPSClick();
                else if (index === 2 && onAccessClick) onAccessClick();
                else if (index === 3 && onFunctionalityClick) onFunctionalityClick();
                else if (index === 4 && onRetailClick) onRetailClick();
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
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#8c8c8c', 
        marginBottom: '24px',
        padding: '0 12px'
      }}>
        💡 Clique o card para os detalhes da geração do indicador
      </div>
    </div>
  );
}