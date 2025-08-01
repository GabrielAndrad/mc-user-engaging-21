import { Modal, Statistic, Card, Row, Col, Button, Empty } from 'antd';
import { DownloadOutlined, TrophyOutlined } from '@ant-design/icons';

interface FunctionalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  functionality: string;
  onExport: () => void;
}

export function FunctionalityModal({ isOpen, onClose, functionality, onExport }: FunctionalityModalProps) {
  // Mock data para demonstração
  const stats = {
    totalUsers: 1247,
    totalAccess: 8493,
    averageTime: 23.5,
    satisfactionScore: 8.7
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)', borderRadius: '2px' }} />
            Funcionalidade mais acessada - {functionality}
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
      width="60%"
      style={{ maxWidth: '800px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Usuários"
              value={stats.totalUsers}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Acessos"
              value={stats.totalAccess}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tempo Médio"
              value={stats.averageTime}
              suffix="min"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nota Satisfação"
              value={stats.satisfactionScore}
              precision={1}
              suffix="/10"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Detalhes de Engajamento" style={{ textAlign: 'center' }}>
        <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <p style={{ fontSize: 16, marginBottom: 8 }}>
          <strong>{functionality}</strong> é a funcionalidade com maior engajamento
        </p>
        <p style={{ color: '#8c8c8c' }}>
          Com {stats.totalUsers.toLocaleString()} usuários únicos e {stats.totalAccess.toLocaleString()} acessos no período selecionado
        </p>
      </Card>
    </Modal>
  );
}