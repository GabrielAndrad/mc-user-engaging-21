import { Modal, Statistic, Card, Row, Col, Button, Progress, Tag, Table, Input } from 'antd';
import { DownloadOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { NpsDetalhes } from '@/interface/Nps';

interface NPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  npsDetails: NpsDetalhes;
  onExport: () => void;
}

export function NPSModal({ isOpen, onClose, npsDetails, onExport }: NPSModalProps) {
  const getNPSCategory = (score: number) => {
    if (score >= 70) return { label: 'Excelente', color: '#52c41a' };
    if (score >= 50) return { label: 'Muito Bom', color: '#1890ff' };
    if (score >= 30) return { label: 'Bom', color: '#faad14' };
    if (score >= 0) return { label: 'Regular', color: '#fa8c16' };
    return { label: 'Crítico', color: '#f5222d' };
  };

  const category = getNPSCategory(npsDetails && npsDetails.npsScore);

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
      {/* Grid customizada conforme o layout solicitado */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* Coluna 1: NPS Score ocupa 2 linhas */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column' }}>
          <Card style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <StarOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic
              title="NPS Score"
              value={npsDetails && npsDetails.npsScore}
              valueStyle={{ color: category.color, fontSize: 36 }}
            />
            <Tag color={category.color} style={{ marginTop: 8 }}>
              {category.label}
            </Tag>
          </Card>
        </div>
        {/* Coluna 2: Grid 2x2 */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Primeira linha: Total Resposta e Taxa de Resposta */}
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic
                title="Total de Respostas"
                value={npsDetails && npsDetails.TotalResponses}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic
                title="Taxa de Resposta"
                value={npsDetails && npsDetails.responseRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </div>
          {/* Segunda linha: Promotores, Neutros, Detratores */}
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            <Card title="Promotores" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic
                value={npsDetails && npsDetails.Promoters}
                valueStyle={{ color: '#52c41a', fontSize: 24 }}
              />
              <Progress 
                type="circle" 
                percent={npsDetails && npsDetails.PromotersPercentage} 
                strokeColor="#52c41a"
                size={60}
                style={{ marginTop: 8 }}
              />
              <p style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>
                Nota 9-10 • Muito satisfeitos
              </p>
            </Card>
            <Card title="Neutros" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic
                value={npsDetails && npsDetails.Passives}
                valueStyle={{ color: '#faad14', fontSize: 24 }}
              />
              <Progress 
                type="circle" 
                percent={npsDetails && npsDetails.PassivesPercentage} 
                strokeColor="#faad14"
                size={60}
                style={{ marginTop: 8 }}
              />
              <p style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>
                Nota 7-8 • Satisfeitos
              </p>
            </Card>
            <Card title="Detratores" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Statistic
                value={npsDetails && npsDetails.Detractors}
                valueStyle={{ color: '#f5222d', fontSize: 24 }}
              />
              <Progress 
                type="circle" 
                percent={npsDetails && npsDetails.DetractorsPercentage} 
                strokeColor="#f5222d"
                size={60}
                style={{ marginTop: 8 }}
              />
              <p style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>
                Nota 0-6 • Insatisfeitos
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Row>
        <Col span={24}>
            <Table
              dataSource={npsDetails && npsDetails.DataNps}
              rowKey={(record) => record.NpsId || record.ClienteNome || Math.random()}
              pagination={{ pageSize: 5 }}
              size="small"
              bordered
              columns={[
                {
                  title: 'Cliente',
                  dataIndex: 'ClienteNome',
                  key: 'ClienteNome',
                  sorter: (a, b) => (a.ClienteNome || '').localeCompare(b.ClienteNome || ''),
                  render: (text, record) => record.ClienteNome,
                  ...getColumnSearchProps('ClienteNome', 'ClienteNome')
                },
                {
                  title: 'Nota',
                  dataIndex: 'Nota',
                  key: 'Nota',
                  align: 'center',
                  sorter: (a, b) => (a.Nota ?? 0) - (b.Nota ?? 0),
                  render: (nota) => (
                    <span style={{
                      color:
                        nota >= 9 ? '#52c41a' :
                        nota >= 7 ? '#faad14' :
                        '#f5222d',
                      fontWeight: 500
                    }}>
                      {nota}
                    </span>
                  ),
                  ...getColumnSearchProps('Nota', 'Nota')
                },
                {
                  title: 'Comentário',
                  dataIndex: 'Descricao',
                  key: 'Descricao',
                  sorter: (a, b) => (a.Descricao || '').localeCompare(b.Descricao || ''),
                  render: (text) => text || <span style={{ color: '#bfbfbf' }}>—</span>,
                  ...getColumnSearchProps('Descricao', 'Descricao')
                },
                {
                  title: 'Data',
                  dataIndex: 'DataCadastro',
                  key: 'DataCadastro',
                  align: 'center',
                  sorter: (a, b) => {
                    const dateA = a.DataCadastro ? new Date(a.DataCadastro).getTime() : 0;
                    const dateB = b.DataCadastro ? new Date(b.DataCadastro).getTime() : 0;
                    return dateA - dateB;
                  },
                  render: (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '—'
                }
              ]}
              locale={{
                emptyText: 'Nenhuma resposta de NPS encontrada.'
              }}
            />
        </Col>
      </Row>
    </Modal>
  );
}