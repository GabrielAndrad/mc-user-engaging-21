import { Modal, Statistic, Card, Row, Col, Button, Table } from 'antd';
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  averageAccess: number;
  onExport: () => void;
}

interface AccessData {
  period: string;
  totalAccess: number;
  uniqueUsers: number;
  averagePerUser: number;
}

export function AccessModal({ isOpen, onClose, averageAccess, onExport }: AccessModalProps) {
  // Mock data para demonstração
  const stats = {
    totalAccess: 24567,
    uniqueUsers: 1843,
    peakHour: '14:00-15:00',
    peakDay: 'Terça-feira'
  };

  const weeklyData: AccessData[] = [
    { period: 'Segunda-feira', totalAccess: 3245, uniqueUsers: 245, averagePerUser: 13.2 },
    { period: 'Terça-feira', totalAccess: 4567, uniqueUsers: 298, averagePerUser: 15.3 },
    { period: 'Quarta-feira', totalAccess: 3890, uniqueUsers: 267, averagePerUser: 14.6 },
    { period: 'Quinta-feira', totalAccess: 4123, uniqueUsers: 289, averagePerUser: 14.3 },
    { period: 'Sexta-feira', totalAccess: 3567, uniqueUsers: 234, averagePerUser: 15.2 },
    { period: 'Sábado', totalAccess: 2845, uniqueUsers: 198, averagePerUser: 14.4 },
    { period: 'Domingo', totalAccess: 2330, uniqueUsers: 167, averagePerUser: 13.9 }
  ];

  const columns: ColumnsType<AccessData> = [
    {
      title: 'Período',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Total de Acessos',
      dataIndex: 'totalAccess',
      key: 'totalAccess',
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    {
      title: 'Usuários Únicos',
      dataIndex: 'uniqueUsers',
      key: 'uniqueUsers',
      align: 'right'
    },
    {
      title: 'Média por Usuário',
      dataIndex: 'averagePerUser',
      key: 'averagePerUser',
      align: 'right',
      render: (value) => `${value} acessos`
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)', borderRadius: '2px' }} />
            Média de Acessos - Detalhamento
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
      width="80%"
      style={{ maxWidth: '1000px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Acessos"
              value={stats.totalAccess}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Usuários Únicos"
              value={stats.uniqueUsers}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pico de Acesso"
              value={stats.peakHour}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dia Mais Ativo"
              value={stats.peakDay}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="Resumo Semanal" style={{ textAlign: 'center' }}>
            <BarChartOutlined style={{ fontSize: 48, color: '#eb2f96', marginBottom: 16 }} />
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              Média de <strong>{averageAccess}</strong> acessos por usuário
            </p>
            <p style={{ color: '#8c8c8c' }}>
              {stats.totalAccess.toLocaleString()} acessos totais no período
            </p>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Distribuição Semanal de Acessos">
            <Table
              columns={columns}
              dataSource={weeklyData}
              rowKey="period"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}