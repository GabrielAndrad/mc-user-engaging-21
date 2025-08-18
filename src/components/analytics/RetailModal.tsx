import { Modal, Statistic, Card, Row, Col, Button, Progress } from 'antd';
import { DownloadOutlined, CrownOutlined } from '@ant-design/icons';
import { VarejoMaisEngajado } from '@/interface/VarejoMaisEngajado';

interface RetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailName: VarejoMaisEngajado;
  onExport: () => void;
}

export function RetailModal({ isOpen, onClose, retailName, onExport }: RetailModalProps) {

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', borderRadius: '2px' }} />
            Varejo mais engajado - {retailName && retailName.VarejoName}
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
          <Card>
            <Statistic
              title="Total de Usuários"
              value={retailName && retailName.TotalUsuarios}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Usuários Ativos"
              value={retailName && retailName.UsuariosAtivos}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Taxa de Engajamento"
              value={retailName && retailName.TaxaEngajamento}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Perfil do Varejo" style={{ textAlign: 'center' }}>
            <CrownOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              <strong>{retailName && retailName.VarejoName}</strong> é o varejo com maior engajamento
            </p>
            <p style={{ color: '#8c8c8c' }}>
              {retailName && retailName.TaxaEngajamento}% de taxa de engajamento com {retailName && retailName.UsuariosAtivos} usuários ativos
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Funcionalidades mais utilizadas">
            {retailName && retailName.TopFuncionalidades && retailName.TopFuncionalidades.length > 0 && retailName.TopFuncionalidades.map((func, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{func.Nome}</span>
                  <span>{func.AccessCountPercente}%</span>
                </div>
                <Progress percent={func.Id} showInfo={false} strokeColor="#722ed1" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}