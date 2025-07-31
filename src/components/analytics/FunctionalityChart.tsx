import { Card, Button, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface FunctionalityData {
  name: string;
  acessos: number;
  tempoMedio: number;
  percentualUsuarios: number;
}

interface FunctionalityChartProps {
  data: FunctionalityData[];
  onDrilldown: (functionality: string) => void;
}

export function FunctionalityChart({ data, onDrilldown }: FunctionalityChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card 
          size="small" 
          style={{ 
            minWidth: '200px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: 'none'
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{label}</Text>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <Text style={{ color: entry.color, fontSize: '12px' }}>
                {entry.name}: {entry.value}
                {entry.dataKey === 'tempoMedio' ? ' min' : 
                 entry.dataKey === 'percentualUsuarios' ? '%' : ''}
              </Text>
            </div>
          ))}
          <Button 
            size="small" 
            type="dashed"
            icon={<EyeOutlined />}
            onClick={() => onDrilldown(label)}
            style={{ marginTop: '8px', width: '100%' }}
          >
            Ver detalhes
          </Button>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card 
      title={
        <Title level={4} style={{ margin: 0, color: '#262626', fontSize: '16px', fontWeight: 500 }}>
          Utilização por Funcionalidade
        </Title>
      }
      style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        backgroundColor: 'white'
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="acessos" 
            name="Total de Acessos"
            fill="#1890ff"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="percentualUsuarios" 
            name="% Usuários Ativos"
            fill="#faad14"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '6px' }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          💡 Clique em uma barra para ver detalhes dos usuários que utilizaram a funcionalidade
        </Text>
      </div>
    </Card>
  );
}