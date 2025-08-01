import { Modal, Table, Tag, Button, Row, Col, Statistic, Card } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ActiveUser {
  name: string;
  email: string;
  type: 'varejo' | 'industria' | 'photocheck';
  account: string;
  sessions: number;
  lastAccess: string;
}

interface ActiveUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: ActiveUser[];
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

export function ActiveUsersModal({ isOpen, onClose, users, onExport }: ActiveUsersModalProps) {
  const totalUsers = users.length;
  const totalSessions = users.reduce((sum, user) => sum + user.sessions, 0);
  const averageSessions = totalUsers > 0 ? totalSessions / totalUsers : 0;

  const columns: ColumnsType<ActiveUser> = [
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
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)', borderRadius: '2px' }} />
            Usuários Ativos - Detalhamento
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
      {/* Resumo dos usuários ativos */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total de usuários ativos"
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
              title="Média de sessões por usuário"
              value={averageSessions.toFixed(1)}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabela de usuários ativos */}
      {users.length > 0 ? (
        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record, index) => `${record.name}-${index}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            size: 'small',
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuários`
          }}
          scroll={{ x: 800 }}
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
          Nenhum usuário ativo encontrado no período selecionado.
        </div>
      )}
    </Modal>
  );
}