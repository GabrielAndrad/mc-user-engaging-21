import { useState } from 'react';
import { Card, Table, Input, Button, Tag, Select, Space, Typography } from 'antd';
import { SearchOutlined, DownloadOutlined, SortAscendingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserData {
  id: string;
  name: string;
  email: string;
  account: string;
  type: 'varejo' | 'industria' | 'photocheck';
  functionality: string;
  totalAccess: number;
  totalTime: number;
  averageTime: number;
  lastAccess: string;
}

interface UserTableProps {
  data: UserData[];
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

export function UserTable({ data, onExport }: UserTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [functionalityFilter, setFunctionalityFilter] = useState<string>('');

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const filteredData = data.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.account.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || user.type === typeFilter;
    const matchesFunctionality = !functionalityFilter || user.functionality === functionalityFilter;
    
    return matchesSearch && matchesType && matchesFunctionality;
  });

  const uniqueFunctionalities = [...new Set(data.map(user => user.functionality))];

  const columns: ColumnsType<UserData> = [
    {
      title: 'Nome do usuário',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span style={{ color: '#8c8c8c' }}>{text}</span>
    },
    {
      title: 'Conta (varejo)',
      dataIndex: 'account',
      key: 'account',
      sorter: (a, b) => a.account.localeCompare(b.account)
    },
    {
      title: 'Funcionalidade',
      dataIndex: 'functionality',
      key: 'functionality'
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
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0, color: '#262626', fontSize: '16px', fontWeight: 500 }}>
            Usuários Detalhados
          </Title>
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={onExport}
          >
            Exportar Tabela
          </Button>
        </div>
      }
      style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        backgroundColor: 'white'
      }}
    >
      {/* Filtros da tabela */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por nome, email ou conta..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={typeFilter || undefined}
            onChange={(value) => setTypeFilter(value || '')}
            placeholder="Todos os tipos"
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="varejo">Varejo</Select.Option>
            <Select.Option value="industria">Indústria</Select.Option>
            <Select.Option value="photocheck">PhotoCheck</Select.Option>
          </Select>
          <Select
            value={functionalityFilter || undefined}
            onChange={(value) => setFunctionalityFilter(value || '')}
            placeholder="Todas funcionalidades"
            style={{ width: 200 }}
            allowClear
          >
            {uniqueFunctionalities.map(func => (
              <Select.Option key={func} value={func}>{func}</Select.Option>
            ))}
          </Select>
        </div>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `Mostrando ${range[0]} a ${range[1]} de ${total} usuários`,
          pageSizeOptions: ['5', '10', '20', '50']
        }}
        scroll={{ x: 1200 }}
        size="small"
        style={{ 
          backgroundColor: 'white',
          borderRadius: '6px'
        }}
      />
    </Card>
  );
}