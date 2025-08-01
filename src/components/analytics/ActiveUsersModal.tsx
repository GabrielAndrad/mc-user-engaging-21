import { Modal, Table, Tag, Button, Input } from 'antd';
import { DownloadOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState, useMemo } from 'react';

interface ActiveUser {
  name: string;
  email: string;
  account: string;
  functionality: string;
  totalAccess: number;
  totalTime: number; // em minutos
  averageTime: number; // em minutos
  lastAccess: string;
}

interface ActiveUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: ActiveUser[];
  onExport: () => void;
}

export function ActiveUsersModal({ isOpen, onClose, users, onExport }: ActiveUsersModalProps) {
  const [searchText, setSearchText] = useState('');

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    
    const searchLower = searchText.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.account.toLowerCase().includes(searchLower)
    );
  }, [users, searchText]);

  // Função para formatar tempo em minutos para horas e minutos
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const columns: ColumnsType<ActiveUser> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (text) => <span style={{ color: '#8c8c8c' }}>{text}</span>
    },
    {
      title: 'Conta',
      dataIndex: 'account',
      key: 'account',
      sorter: (a, b) => a.account.localeCompare(b.account)
    },
    {
      title: 'Funcionalidade',
      dataIndex: 'functionality',
      key: 'functionality',
      sorter: (a, b) => a.functionality.localeCompare(b.functionality)
    },
    {
      title: 'Total de acessos',
      dataIndex: 'totalAccess',
      key: 'totalAccess',
      align: 'right',
      sorter: (a, b) => a.totalAccess - b.totalAccess,
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>
    },
    {
      title: 'Tempo total',
      dataIndex: 'totalTime',
      key: 'totalTime',
      align: 'right',
      sorter: (a, b) => a.totalTime - b.totalTime,
      render: (value) => formatTime(value)
    },
    {
      title: 'Tempo médio',
      dataIndex: 'averageTime',
      key: 'averageTime',
      align: 'right',
      sorter: (a, b) => a.averageTime - b.averageTime,
      render: (value) => formatTime(value)
    },
    {
      title: 'Último acesso',
      dataIndex: 'lastAccess',
      key: 'lastAccess',
      sorter: (a, b) => new Date(a.lastAccess).getTime() - new Date(b.lastAccess).getTime()
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
              Exportar Tabela
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
      width="95%"
      style={{ maxWidth: '1600px' }}
      styles={{
        body: { maxHeight: '75vh', overflowY: 'auto' }
      }}
    >
      {/* Campo de busca */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nome, e-mail ou conta..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>

      {/* Tabela de usuários ativos */}
      {filteredUsers.length > 0 ? (
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey={(record, index) => `${record.name}-${record.email}-${index}`}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            size: 'small',
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} usuários`
          }}
          scroll={{ x: 1200 }}
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
          {searchText ? 'Nenhum usuário encontrado para a busca realizada.' : 'Nenhum usuário ativo encontrado no período selecionado.'}
        </div>
      )}
    </Modal>
  );
}