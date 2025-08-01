import { Modal, Statistic, Card, Row, Col, Button, Progress } from 'antd';
import { DownloadOutlined, CrownOutlined } from '@ant-design/icons';

interface RetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailName: string;
  onExport: () => void;
}

export function RetailModal({ isOpen, onClose, retailName, onExport }: RetailModalProps) {
  // Mock data para demonstração
  const stats = {
    totalUsers: 847,
    activeUsers: 623,
    engagementRate: 73.6,
    averageSessionTime: 18.3,
    topFunctionalities: [
      { name: 'PDV', usage: 95 },
      { name: 'Estoque', usage: 78 },
      { name: 'Vendas', usage: 65 },
      { name: 'Relatórios', usage: 45 }
    ]
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', borderRadius: '2px' }} />
            Varejo mais engajado - {retailName}
          </div>
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={onExport}
            size="small"
          >
            Exportar Dados
          </Button>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="70%"
      style={{ maxWidth: '900px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Usuários"
              value={stats.totalUsers}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Usuários Ativos"
              value={stats.activeUsers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Taxa de Engajamento"
              value={stats.engagementRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tempo Médio Sessão"
              value={stats.averageSessionTime}
              precision={1}
              suffix="min"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Perfil do Varejo" style={{ textAlign: 'center' }}>
            <CrownOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              <strong>{retailName}</strong> é o varejo com maior engajamento
            </p>
            <p style={{ color: '#8c8c8c' }}>
              {stats.engagementRate}% de taxa de engajamento com {stats.activeUsers} usuários ativos
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Funcionalidades mais utilizadas">
            {stats.topFunctionalities.map((func, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{func.name}</span>
                  <span>{func.usage}%</span>
                </div>
                <Progress percent={func.usage} showInfo={false} strokeColor="#722ed1" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}