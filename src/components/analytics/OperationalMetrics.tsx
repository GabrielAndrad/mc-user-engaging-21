import { Card, Row, Col, Typography, Tooltip } from 'antd';
import {
  FileTextOutlined,
  PlayCircleOutlined,
  ShoppingOutlined,
  CheckSquareOutlined,
  SyncOutlined,
  CameraOutlined,
  DollarOutlined,
  PercentageOutlined,
  DownOutlined,
  UpOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

export interface OperationalMetricsData {
  contratos: number;
  execucoes: number;
  produtos: number;
  tarefas: number;
  inventariosAlterados: number;
  fluxoPagamento: number;
  receitaComercial: number;
  receitaComercialAnoAnterior?: number;
  faturamentoRecebido: number;
  faturamentoRecebidoAnoAnterior?: number;
  percentualExecucao: number;
  // Ano anterior
  contratosAnoAnterior?: number;
  execucoesAnoAnterior?: number;
  produtosAnoAnterior?: number;
  tarefasAnoAnterior?: number;
  inventariosAlteradosAnoAnterior?: number;
  fluxoPagamentoAnoAnterior?: number;
  percentualExecucaoAnoAnterior?: number;
}

interface OperationalMetricsProps {
  data: OperationalMetricsData;
}

type MetricKey = 'contratos' | 'execucoes' | 'produtos' | 'tarefas' | 'inventariosAlterados' | 'fluxoPagamento' | 'receitaComercial' | 'faturamentoRecebido' | 'percentualExecucao';
type MetricKeyAnoAnterior = 'contratosAnoAnterior' | 'execucoesAnoAnterior' | 'produtosAnoAnterior' | 'tarefasAnoAnterior' | 'inventariosAlteradosAnoAnterior' | 'fluxoPagamentoAnoAnterior' | 'receitaComercialAnoAnterior' | 'faturamentoRecebidoAnoAnterior' | 'percentualExecucaoAnoAnterior';

interface MetricConfig {
  key: MetricKey;
  keyAnoAnterior: MetricKeyAnoAnterior;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  format?: string;
}

const mainMetrics: MetricConfig[] = [
  {
    key: 'contratos',
    keyAnoAnterior: 'contratosAnoAnterior',
    title: 'Qtde Contratos',
    icon: <FileTextOutlined style={{ color: '#1890ff', fontSize: '24px' }} />,
    color: '#1890ff',
    bgColor: '#e6f7ff',
  },
  {
    key: 'receitaComercial',
    keyAnoAnterior: 'receitaComercialAnoAnterior',
    title: 'Receita Comercial',
    icon: <DollarOutlined style={{ color: '#52c41a', fontSize: '24px' }} />,
    color: '#52c41a',
    bgColor: '#f6ffed',
    format: 'currency',
  },
  {
    key: 'faturamentoRecebido',
    keyAnoAnterior: 'faturamentoRecebidoAnoAnterior',
    title: 'Faturamento Recebido',
    icon: <DollarOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />,
    color: '#13c2c2',
    bgColor: '#e6fffb',
    format: 'currency',
  },
  {
    key: 'percentualExecucao',
    keyAnoAnterior: 'percentualExecucaoAnoAnterior',
    title: '% de Execução',
    icon: <PercentageOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />,
    color: '#fa8c16',
    bgColor: '#fff7e6',
    format: 'percent',
  },
];

const expandedMetrics: MetricConfig[] = [
  {
    key: 'execucoes',
    keyAnoAnterior: 'execucoesAnoAnterior',
    title: 'Execuções',
    icon: <PlayCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />,
    color: '#52c41a',
    bgColor: '#f6ffed',
  },
  {
    key: 'produtos',
    keyAnoAnterior: 'produtosAnoAnterior',
    title: 'Produtos',
    icon: <ShoppingOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />,
    color: '#fa8c16',
    bgColor: '#fff7e6',
  },
  {
    key: 'tarefas',
    keyAnoAnterior: 'tarefasAnoAnterior',
    title: 'Tarefas',
    icon: <CheckSquareOutlined style={{ color: '#722ed1', fontSize: '24px' }} />,
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
  {
    key: 'inventariosAlterados',
    keyAnoAnterior: 'inventariosAlteradosAnoAnterior',
    title: 'Inventários Alterados',
    icon: <SyncOutlined style={{ color: '#eb2f96', fontSize: '24px' }} />,
    color: '#eb2f96',
    bgColor: '#fff0f6',
  },
  {
    key: 'fluxoPagamento',
    keyAnoAnterior: 'fluxoPagamentoAnoAnterior',
    title: 'Fluxo de Pagamento',
    icon: <CameraOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />,
    color: '#13c2c2',
    bgColor: '#e6fffb',
  },
];

function formatValue(value: number, format?: string) {
  if (format === 'currency') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  return (value ?? 0).toLocaleString('pt-BR');
}

function calcVariation(current: number, previous?: number): { pct: number; direction: 'up' | 'down' | 'equal' } | null {
  if (previous == null) return null;
  if (previous === 0 && current === 0) return { pct: 0, direction: 'equal' };
  if (previous === 0) return { pct: 100, direction: 'up' };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return { pct: Math.abs(pct), direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'equal' };
}

function VariationBadge({ current, previous, format }: { current: number; previous?: number; format?: string }) {
  const variation = calcVariation(current, previous);
  if (!variation) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '11px',
        color: '#8c8c8c',
        fontWeight: 500,
        backgroundColor: '#f5f5f5',
        padding: '2px 6px',
        borderRadius: '4px',
        marginTop: '4px',
      }}>
        <MinusOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
        Sem comparação
      </div>
    );
  }

  const color = variation.direction === 'up' ? '#52c41a' : variation.direction === 'down' ? '#ff4d4f' : '#8c8c8c';
  const Icon = variation.direction === 'up' ? CaretUpOutlined : variation.direction === 'down' ? CaretDownOutlined : MinusOutlined;
  const previousFormatted = previous != null ? formatValue(previous, format) : '';

  return (
    <Tooltip title={`Ano anterior: ${previousFormatted}`}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: '11px',
        color,
        fontWeight: 600,
        backgroundColor: `${color}15`,
        padding: '2px 6px',
        borderRadius: '4px',
        marginTop: '4px',
      }}>
        <Icon style={{ fontSize: '10px' }} />
        {variation.pct.toFixed(1)}%
      </div>
    </Tooltip>
  );
}

function MetricCard({ metric, data }: { metric: MetricConfig; data: OperationalMetricsData }) {
  const currentValue = data[metric.key] ?? 0;
  const previousValue = data[metric.keyAnoAnterior];

  return (
    <Card
      style={{
        backgroundColor: metric.bgColor,
        border: `2px solid ${metric.color}`,
        borderRadius: '12px',
        height: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      bodyStyle={{ padding: '16px', textAlign: 'center' }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
      }}>
        {metric.icon}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: metric.color,
        lineHeight: 1,
        marginBottom: '4px',
      }}>
        {formatValue(currentValue, metric.format)}
      </div>
      <VariationBadge current={currentValue} previous={previousValue} format={metric.format} />
      <div style={{
        fontSize: '11px',
        color: '#595959',
        fontWeight: 500,
        marginTop: '4px',
      }}>
        {metric.title}
      </div>
    </Card>
  );
}

export function OperationalMetrics({ data }: OperationalMetricsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ padding: '16px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '16px', color: '#262626' }}>
          Indicadores Operacionais
        </Text>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: 'pointer',
            color: '#1890ff',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none',
          }}
        >
          {expanded ? 'Recolher' : 'Ver mais'} {expanded ? <UpOutlined /> : <DownOutlined />}
        </div>
      </div>

      {/* 3 Main Cards */}
      <Row gutter={[12, 12]}>
        {mainMetrics.map((metric) => (
          <Col key={metric.key} xs={24} sm={12} md={6}>
            <MetricCard metric={metric} data={data} />
          </Col>
        ))}
      </Row>

      {/* Expanded Cards */}
      {expanded && (
        <Row gutter={[12, 12]} style={{ marginTop: '12px' }}>
          {expandedMetrics.map((metric) => (
            <Col key={metric.key} xs={24} sm={12} md={8} lg={4} xl={4} style={{ minWidth: '19%' }}>
              <MetricCard metric={metric} data={data} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
