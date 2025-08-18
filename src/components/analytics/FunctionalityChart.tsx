import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
          {payload.map((entry: any, index: number) => {
            let value = entry.value;

            if (entry.dataKey === 'tempoMedio') {
              value = `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} min`;
            } else if (entry.dataKey === 'percentualUsuarios') {
              value = `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`;
            } else {
              value = value.toLocaleString('pt-BR');
            }

            return (
              <div key={index} style={{ marginBottom: '4px' }}>
                <Text style={{ color: entry.color, fontSize: '12px' }}>
                  {entry.name}: {value}
                </Text>
              </div>
            );
          })}
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
          💡 Passe o mouse em cima da barra para ver os detalhes da funcionalidade
        </Text>
      </div>
    </Card>
  );
}
