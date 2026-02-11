import { Card, Row, Col, Typography } from 'antd';
import {
  FileTextOutlined,
  PlayCircleOutlined,
  ShoppingOutlined,
  CheckSquareOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export interface OperationalMetricsData {
  contratos: number;
  execucoes: number;
  produtos: number;
  tarefas: number;
  inventariosAlterados: number;
}

interface OperationalMetricsProps {
  data: OperationalMetricsData;
}

const metrics = [
  {
    key: 'contratos' as const,
    title: 'Qtde de Contratos',
    icon: <FileTextOutlined style={{ color: '#1890ff', fontSize: '24px' }} />,
    color: '#1890ff',
    bgColor: '#e6f7ff',
  },
  {
    key: 'execucoes' as const,
    title: 'Qtde de Execuções',
    icon: <PlayCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />,
    color: '#52c41a',
    bgColor: '#f6ffed',
  },
  {
    key: 'produtos' as const,
    title: 'Qtde de Produtos',
    icon: <ShoppingOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />,
    color: '#fa8c16',
    bgColor: '#fff7e6',
  },
  {
    key: 'tarefas' as const,
    title: 'Qtde de Tarefas',
    icon: <CheckSquareOutlined style={{ color: '#722ed1', fontSize: '24px' }} />,
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
  {
    key: 'inventariosAlterados' as const,
    title: 'Qtde de Inventários Alterados',
    icon: <SyncOutlined style={{ color: '#eb2f96', fontSize: '24px' }} />,
    color: '#eb2f96',
    bgColor: '#fff0f6',
  },
];

export function OperationalMetrics({ data }: OperationalMetricsProps) {
  return (
    <div style={{ padding: '16px 12px' }}>
      <Text strong style={{ fontSize: '16px', color: '#262626', display: 'block', marginBottom: '16px' }}>
        Indicadores Operacionais
      </Text>
      <Row gutter={[12, 12]}>
        {metrics.map((metric) => (
          <Col key={metric.key} xs={24} sm={12} md={8} lg={4} xl={4} style={{ minWidth: '19%' }}>
            <Card
              style={{
                backgroundColor: metric.bgColor,
                border: `2px solid ${metric.color}`,
                borderRadius: '12px',
                height: '140px',
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
                margin: '0 auto 10px',
              }}>
                {metric.icon}
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: metric.color,
                lineHeight: 1,
                marginBottom: '6px',
              }}>
                {(data[metric.key] ?? 0).toLocaleString('pt-BR')}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#595959',
                fontWeight: 500,
              }}>
                {metric.title}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
