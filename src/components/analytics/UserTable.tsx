import { useState } from 'react';
import { Card, Table, Input, Button, Tag, Select, Space, Typography } from 'antd';
import { SearchOutlined, DownloadOutlined, SortAscendingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { UsuarioAtivoEngajamento } from '@/interface/UsuariosAtivos';

const { Title } = Typography;



interface UserTableProps {
  data: UsuarioAtivoEngajamento[];
  onExport: () => void;
  comboFuncionalidade:any,
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

export function UserTable({ data, onExport,comboFuncionalidade }: UserTableProps) {
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
    const searchTerm = (search || '').toLowerCase();
  
    const matchesSearch =
      (user.Nome || '').toLowerCase().includes(searchTerm) ||
      (user.Email || '').toLowerCase().includes(searchTerm) ||
      (user.ClienteNome || '').toLowerCase().includes(searchTerm);
  
    const matchesType = !typeFilter
    const matchesFunctionality = !functionalityFilter || user.ClienteNome === functionalityFilter;
  
    return matchesSearch && matchesType && matchesFunctionality;
  });

  const uniqueFunctionalities = [...new Set(data.map(user => user.ClienteNome))];

  const columns: ColumnsType<UsuarioAtivoEngajamento> = [
    {
      title: 'Nome do usuário',
      dataIndex: 'Nome',
      key: 'Nome',
      sorter: (a, b) => a.Nome.localeCompare(a.Nome),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'E-mail',
      dataIndex: 'Email',
      key: 'Email',
      render: (text) => <span style={{ color: '#8c8c8c' }}>{text}</span>
    },
    {
      title: 'Conta (varejo)',
      dataIndex: 'ClienteNome',
      key: 'ClienteNome',
      sorter: (a, b) => a.ClienteNome.localeCompare(a.ClienteNome)
    },
    {
      title: 'Total de acessos',
      dataIndex: 'TotalAcesso',
      key: 'TotalAcesso',
      align: 'right',
      sorter: (a, b) => a.TotalAcesso - b.TotalAcesso,
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>
    },
    {
      title: 'Último acesso',
      dataIndex: 'UltimoAcesso',
      key: 'UltimoAcesso',
      sorter: (a, b) => new Date(a.UltimoAcesso).getTime() - new Date(b.UltimoAcesso).getTime()
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
            value={functionalityFilter || undefined}
            onChange={(value) => setFunctionalityFilter(value || '')}
            placeholder="Todas funcionalidades"
            style={{ width: 200 }}
            allowClear
          >
            {comboFuncionalidade? comboFuncionalidade.map(func => (
              <Select.Option key={func.MenuId} value={func.MenuId}>{func.Nome}</Select.Option>
            )):[]}
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