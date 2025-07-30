import { Modal, Table, Tag, Button, Row, Col, Statistic, Card } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DrilldownUser {
  name: string;
  email: string;
  type: 'varejo' | 'industria' | 'photocheck';
  account: string;
  totalTime: number;
  averageTime: number;
  sessions: number;
  lastAccess: string;
}

interface DrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  functionality: string;
  users: DrilldownUser[];
  onExport: () => void;
}

const USER_TYPE_LABELS = {
  varejo: 'Varejo',
  industria: 'Indústria',
  photocheck: 'PhotoCheck'
};

const USER_TYPE_COLORS = {
  varejo: 'blue',
  industria: 'purple',
  photocheck: 'green'
};

export function DrilldownModal({ isOpen, onClose, functionality, users, onExport }: DrilldownModalProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const totalUsers = users.length;
  const totalSessions = users.reduce((sum, user) => sum + user.sessions, 0);
  const averageSessionTime = totalUsers > 0 ? users.reduce((sum, user) => sum + user.averageTime, 0) / totalUsers : 0;

  const columns: ColumnsType<DrilldownUser> = [
    {
      title: 'Nome do usuário',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span style={{ color: '#8c8c8c' }}>{text}</span>
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof USER_TYPE_LABELS) => (
        <Tag color={USER_TYPE_COLORS[type]}>
          {USER_TYPE_LABELS[type]}
        </Tag>
      )
    },
    {
      title: 'Conta (varejo)',
      dataIndex: 'account',
      key: 'account'
    },
    {
      title: 'Sessões',
      dataIndex: 'sessions',
      key: 'sessions',
      align: 'right',
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>
    },
    {
      title: 'Tempo total',
      dataIndex: 'totalTime',
      key: 'totalTime',
      align: 'right',
      render: (value) => formatTime(value)
    },
    {
      title: 'Tempo médio',
      dataIndex: 'averageTime',
      key: 'averageTime',
      align: 'right',
      render: (value) => formatTime(value)
    },
    {
      title: 'Último acesso',
      dataIndex: 'lastAccess',
      key: 'lastAccess'
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '2px' }} />
            Detalhes da funcionalidade: {functionality}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />} 
              onClick={onExport}
              size="small"
            >
              Exportar
            </Button>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              size="small"
            />
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '1400px' }}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
    >
      {/* Resumo da funcionalidade */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Usuários únicos"
              value={totalUsers}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total de sessões"
              value={totalSessions}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tempo médio por sessão"
              value={formatTime(Math.round(averageSessionTime))}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabela de usuários */}
      {users.length > 0 ? (
        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record, index) => `${record.name}-${index}`}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            size: 'small'
          }}
          scroll={{ x: 1000 }}
          size="small"
        />
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: '#8c8c8c',
          backgroundColor: '#fafafa',
          borderRadius: '6px'
        }}>
          Nenhum usuário encontrado para esta funcionalidade no período selecionado.
        </div>
      )}
    </Modal>
  );
}