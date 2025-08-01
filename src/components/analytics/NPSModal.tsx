import { Modal, Statistic, Card, Row, Col, Button, Progress, Tag } from 'antd';
import { DownloadOutlined, StarOutlined } from '@ant-design/icons';

interface NPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  npsScore: number;
  onExport: () => void;
}

export function NPSModal({ isOpen, onClose, npsScore, onExport }: NPSModalProps) {
  // Mock data para demonstração
  const stats = {
    totalResponses: 1842,
    promoters: 987,
    passives: 623,
    detractors: 232,
    promotersPercentage: 53.6,
    passivesPercentage: 33.8,
    detractorsPercentage: 12.6
  };

  const getNPSCategory = (score: number) => {
    if (score >= 70) return { label: 'Excelente', color: '#52c41a' };
    if (score >= 50) return { label: 'Muito Bom', color: '#1890ff' };
    if (score >= 30) return { label: 'Bom', color: '#faad14' };
    if (score >= 0) return { label: 'Regular', color: '#fa8c16' };
    return { label: 'Crítico', color: '#f5222d' };
  };

  const category = getNPSCategory(npsScore);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', borderRadius: '2px' }} />
            NPS Score - Índice de Satisfação
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
        <Col span={8}>
          <Card style={{ textAlign: 'center' }}>
            <StarOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic
              title="NPS Score"
              value={npsScore}
              valueStyle={{ color: category.color, fontSize: 36 }}
            />
            <Tag color={category.color} style={{ marginTop: 8 }}>
              {category.label}
            </Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total de Respostas"
              value={stats.totalResponses}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Taxa de Resposta"
              value={78.4}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="Promotores" style={{ textAlign: 'center' }}>
            <Statistic
              value={stats.promoters}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
            <Progress 
              type="circle" 
              percent={stats.promotersPercentage} 
              strokeColor="#52c41a"
              size={80}
              style={{ marginTop: 16 }}
            />
            <p style={{ marginTop: 8, color: '#8c8c8c' }}>
              Nota 9-10 • Muito satisfeitos
            </p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Neutros" style={{ textAlign: 'center' }}>
            <Statistic
              value={stats.passives}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
            />
            <Progress 
              type="circle" 
              percent={stats.passivesPercentage} 
              strokeColor="#faad14"
              size={80}
              style={{ marginTop: 16 }}
            />
            <p style={{ marginTop: 8, color: '#8c8c8c' }}>
              Nota 7-8 • Satisfeitos
            </p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Detratores" style={{ textAlign: 'center' }}>
            <Statistic
              value={stats.detractors}
              valueStyle={{ color: '#f5222d', fontSize: 24 }}
            />
            <Progress 
              type="circle" 
              percent={stats.detractorsPercentage} 
              strokeColor="#f5222d"
              size={80}
              style={{ marginTop: 16 }}
            />
            <p style={{ marginTop: 8, color: '#8c8c8c' }}>
              Nota 0-6 • Insatisfeitos
            </p>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}