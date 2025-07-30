import { useState } from 'react';
import { Card, Button, Input, Select, Checkbox, DatePicker, Space, Typography, Row, Col, Divider } from 'antd';
import { DownloadOutlined, FilterFilled, CalendarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DateRange } from 'react-day-picker';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export interface FilterState {
  dateRange: DateRange | undefined;
  userTypes: string[];
  functionality: string;
  account: string;
  nps: string;
}

interface FilterSectionProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
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

const FUNCTIONALITIES = [
  'PhotoCheck',
  'JBP',
  'ROI',
  'Sell-Out',
  'Painel de Indicadores',
  'Cadastro de Loja',
  'Análise de Vendas',
];

const NPS_OPTIONS = [
  { value: 'promotores', label: 'Promotores (9-10)' },
  { value: 'neutros', label: 'Neutros (7-8)' },
  { value: 'detratores', label: 'Detratores (0-6)' },
];

export function FilterSection({ filters, onFiltersChange, onExport }: FilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    onFiltersChange({
      ...filters,
      dateRange: { from, to }
    });
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onFiltersChange({
        ...filters,
        dateRange: {
          from: dates[0].toDate(),
          to: dates[1].toDate()
        }
      });
    } else {
      onFiltersChange({
        ...filters,
        dateRange: undefined
      });
    }
  };

  const handleUserTypeChange = (checkedValues: string[]) => {
    onFiltersChange({
      ...filters,
      userTypes: checkedValues
    });
  };

  const dateValue: [Dayjs | null, Dayjs | null] | null = filters.dateRange 
    ? [
        filters.dateRange.from ? dayjs(filters.dateRange.from) : null,
        filters.dateRange.to ? dayjs(filters.dateRange.to) : null
      ]
    : null;

  return (
    <Card 
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Período</Typography.Text>
            <RangePicker
              value={dateValue}
              onChange={handleDateRangeChange}
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
              value={filters.functionality || undefined}
              onChange={(value) => onFiltersChange({ ...filters, functionality: value || '' })}
              placeholder="Todas as funcionalidades"
              style={{ width: '100%' }}
              allowClear
            >
              {FUNCTIONALITIES.map(func => (
                <Select.Option key={func} value={func}>{func}</Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Varejo</Typography.Text>
            <Select
              value={filters.account || undefined}
              onChange={(value) => onFiltersChange({ ...filters, account: value || '' })}
              placeholder="Selecionar conta..."
              style={{ width: '100%' }}
              allowClear
            >
              <Select.Option value="supermercado-extra">Supermercado Extra</Select.Option>
              <Select.Option value="carrefour">Carrefour</Select.Option>
              <Select.Option value="koch">Koch</Select.Option>
              <Select.Option value="bigbox">BigBox</Select.Option>
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>NPS</Typography.Text>
            <Select
              value={filters.nps || undefined}
              onChange={(value) => onFiltersChange({ ...filters, nps: value || '' })}
              placeholder="Todos os tipos"
              style={{ width: '100%' }}
              allowClear
            >
              {NPS_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6} lg={7}>
          <div style={{ display: 'flex', alignItems: 'end', height: '100%', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              type="link"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ color: '#1890ff', padding: 0 }}
              icon={<FilterFilled style={{ color: '#1890ff' }} />}
            />
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
                <Typography.Text strong>Tipo de Usuário</Typography.Text>
                <Checkbox.Group
                  options={USER_TYPES}
                  value={filters.userTypes}
                  onChange={handleUserTypeChange}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text strong>Períodos Rápidos</Typography.Text>
                <Space wrap>
                  {PRESET_PERIODS.map(preset => (
                    <Button
                      key={preset.value}
                      size="small"
                      type="dashed"
                      onClick={() => handleDatePreset(preset.value)}
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