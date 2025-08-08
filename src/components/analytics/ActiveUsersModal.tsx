import { Modal, Table, Tag, Button, Input, Select } from 'antd';
import { DownloadOutlined, CloseOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState, useMemo } from 'react';

interface ActiveUser {
  name: string;
  email: string;
  account: string;
  functionality: string;
  totalAccess: number;
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
  const [accountFilter, setAccountFilter] = useState<string[]>([]);
  const [functionalityFilter, setFunctionalityFilter] = useState<string[]>([]);

  // Filtrar usuários baseado na busca e filtros
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Filtro de busca
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.account.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro de conta
    if (accountFilter.length > 0) {
      filtered = filtered.filter(user => accountFilter.includes(user.account));
    }
    
    // Filtro de funcionalidade
    if (functionalityFilter.length > 0) {
      filtered = filtered.filter(user => functionalityFilter.includes(user.functionality));
    }
    
    return filtered;
  }, [users, searchText, accountFilter, functionalityFilter]);

  // Obter valores únicos para filtros
  const uniqueAccounts = useMemo(() => 
    [...new Set(users.map(user => user.account))].sort(),
    [users]
  );

  const uniqueFunctionalities = useMemo(() => 
    [...new Set(users.map(user => user.functionality))].sort(),
    [users]
  );

  // Função para criar filtro dropdown customizado
  const getColumnSearchProps = (dataIndex: string, title: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Buscar ${title.toLowerCase()}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Limpar
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });


  const columns: ColumnsType<ActiveUser> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
      ...getColumnSearchProps('name', 'Nome')
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (text) => <span style={{ color: '#8c8c8c' }}>{text}</span>,
      ...getColumnSearchProps('email', 'E-mail')
    },
    {
      title: 'Conta',
      dataIndex: 'account',
      key: 'account',
      sorter: (a, b) => a.account.localeCompare(b.account),
      filters: uniqueAccounts.map(account => ({ text: account, value: account })),
      onFilter: (value: any, record: ActiveUser) => record.account === value,
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      )
    },
    {
      title: 'Funcionalidade',
      dataIndex: 'functionality',
      key: 'functionality',
      sorter: (a, b) => a.functionality.localeCompare(b.functionality),
      filters: uniqueFunctionalities.map(func => ({ text: func, value: func })),
      onFilter: (value: any, record: ActiveUser) => record.functionality === value,
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      )
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
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={onExport}
            size="small"
          >
            Exportar Tabela
          </Button>
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