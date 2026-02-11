import { useState } from 'react';
import { Card, Button, Input, Select, Checkbox, DatePicker, Space, Typography, Row, Col, Divider } from 'antd';
import { DownloadOutlined, FilterFilled, CalendarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DateRange } from 'react-day-picker';
import { useClientes } from '@/hooks/useClientes';
import { LoadIndicadoresAll } from '@/Stores/Indicadores-store';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export interface FilterState {
  dataInicio: Date;
  dataFim: Date;
  funcionalidade: number[];
  varejo: number[];
  Nps: number[];
  PeriodosRapidos: number[];
  csResponsavel?: string;
  segmento?: string;
}

interface FilterSectionProps {
  ValuesFilters:FilterState,
  Combos:any,
  onFiltersChange: (dataIndex:string,value: any) => void;
  onExport: () => void;
}

const PRESET_PERIODS = [
  { label: 'Últimos 7 dias', value: 7 },
  { label: 'Últimos 30 dias', value: 30 },
  { label: 'Trimestre atual', value: 90 },
];

const USER_TYPES = [
  { value: 'varejo', label: 'Varejo' },
  { value: 'industria', label: 'Indústria' },
  { value: 'photocheck', label: 'Operação (PhotoCheck)' },
];

const NPS_OPTIONS = [
  { value: 1, label: 'Promotores (9-10)' },
  { value: 2, label: 'Neutros (7-8)' },
  { value: 3, label: 'Detratores (0-6)' },
];

const SEGMENTO_OPTIONS = [
  { value: 1, label: 'Enterprise' },
  { value: 2, label: 'SMB' },
  { value: 3, label: 'Crialed' },
];

export function FilterSection({
  ValuesFilters,
  onFiltersChange,
  onExport,
  Combos
}: FilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { clientes, loading: loadingClientes } = useClientes();

  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    // Atualiza os filtros de data conforme a lógica do componente
    onFiltersChange('dataInicio', from.toISOString().slice(0, 10));
    onFiltersChange('dataFim', to.toISOString().slice(0, 10));
  };

  const dateValue: [Dayjs | null, Dayjs | null] | null =
  ValuesFilters?.dataInicio && ValuesFilters?.dataFim
    ? [
        ValuesFilters.dataInicio ? dayjs(ValuesFilters.dataInicio) : null,
        ValuesFilters.dataFim? dayjs(ValuesFilters.dataFim) : null
      ]
    : null;

  return (
    <Card 
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)',width:'100%' }}
    >
      <Row style={{alignItems:'flex-end'}} gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Período</Typography.Text>
            <RangePicker
              value={dateValue}
              onChange={(dates) => {
                  const formatDate = (date) => date ? date.format('YYYY-MM-DD') : null;
                  onFiltersChange('dataInicio', formatDate(dates[0]));
                  onFiltersChange('dataFim', formatDate(dates[1]));
              }}
              format="DD/MM/YYYY"
              placeholder={['Data inicial', 'Data final']}
              style={{ width: '100%' }}
              suffixIcon={<CalendarOutlined />}
            />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Funcionalidade</Typography.Text>
            <Select
              value={ValuesFilters.funcionalidade}
              onChange={(value) => onFiltersChange('funcionalidade',value)}
              placeholder="Todas as funcionalidades"
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {Combos && Combos.funcionalidade?Combos.funcionalidade.map(func => (
                <Select.Option key={func.MenuId} value={func.MenuId}>{func.Nome}</Select.Option>
              )):[]}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Varejo</Typography.Text>
            <Select
              value={ValuesFilters.varejo}
              onChange={(value) => onFiltersChange('varejo',value)}
              placeholder="Selecionar conta..."
              style={{ width: '100%' }}
              allowClear
              loading={loadingClientes}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {clientes.map(cliente => (
                <Select.Option key={cliente.ClienteId} value={cliente.ClienteId.toString()}>
                  {cliente.NomeEmpresa}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>NPS</Typography.Text>
            <Select
              value={ValuesFilters.Nps}
              onChange={(value) => onFiltersChange('Nps',value)}
              placeholder="Todos os tipos"
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {NPS_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>CS Responsável</Typography.Text>
            <Select
              value={ValuesFilters.csResponsavel}
              onChange={(value) => onFiltersChange('csResponsavel', value)}
              placeholder="Todos"
              style={{ width: '100%' }}
              allowClear
              showSearch
              loading={Combos?.loadingCsResponsavel}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {Combos && Combos.csResponsavel ? Combos.csResponsavel.map((cs: any) => (
                <Select.Option key={cs.id || cs.Id} value={cs.id || cs.Id}>{cs.nome || cs.Nome}</Select.Option>
              )) : []}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Tipo de Cliente</Typography.Text>
            <Select
              value={ValuesFilters.segmento}
              onChange={(value) => onFiltersChange('segmento', value)}
              placeholder="Todos"
              style={{ width: '100%' }}
              allowClear
            >
              {SEGMENTO_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col span={1}>
        <Button
              type="link"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ color: '#1890ff', padding: 0 }}
              icon={<FilterFilled style={{ color: '#1890ff' }} />}
            />
        </Col>
        <Col span={2}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={()=>LoadIndicadoresAll()} type='primary'>Filtrar</Button>
          </Space>
        </Col>

        <Col span={4}>
          <div style={{ display: 'flex', alignItems: 'end', height: '100%', gap: '8px', justifyContent: 'flex-end' }}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />} 
              onClick={onExport}
            >
              Exportar CSV
            </Button>
          </div>
        </Col>
      </Row>

      {showAdvanced && (
        <>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text strong>Períodos Rápidos</Typography.Text>
                <Space wrap>
                  {PRESET_PERIODS.map(preset => (
                    <Button
                      key={preset.value}
                      size="small"
                      onClick={()=>handleDatePreset(preset.value)}
                      type="dashed"

                    >
                      {preset.label}
                    </Button>
                  ))}
                </Space>
              </Space>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}