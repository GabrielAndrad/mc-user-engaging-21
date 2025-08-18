import { Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

interface TimelineData {
  date: string;
  acessos: number;
  DiaSemana: string;
}

interface TimelineChartProps {
  data: TimelineData[];
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
}

export function TimelineChart({ data }: TimelineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Busca o dia da semana do dado correspondente ao label
      const dataItem = data.find(item => item.date === label);
      const diaSemana = dataItem ? dataItem.DiaSemana : '';
      return (
        <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            {diaSemana} - {formatDateLabel(label)}
          </Text>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <Text style={{ color: entry.color, fontSize: '12px' }}>
                {entry.name}: {entry.value} acessos
              </Text>
            </div>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0, color: '#262626', fontSize: '16px', fontWeight: 500 }}>
          Evolução Diária de Acessos (Últimos 30 dias)
        </Title>
      }
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        backgroundColor: 'white'
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="acessos"
            stroke="#1890ff"
            strokeWidth={3}
            dot={{ fill: "#1890ff", strokeWidth: 2, r: 4 }}
            name="Total de Acessos"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}