import { Card, Row, Col, Tag, Typography, Space, Select } from 'antd';
import { TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;

interface FunctionalityData {
  name: string;
  acessos: number;
  tempoMedio: number;
  percentualUsuarios: number;
}

interface FunctionalityRankingProps {
  data: FunctionalityData[];
}

export function FunctionalityRanking({ data }: FunctionalityRankingProps) {
  const [mostUsedQuantity, setMostUsedQuantity] = useState(3);
  const [leastUsedQuantity, setLeastUsedQuantity] = useState(3);
  
  // Sort by total accesses to get most and least used
  const sortedByAccess = [...data].sort((a, b) => b.acessos - a.acessos);
  const mostUsed = sortedByAccess.slice(0, mostUsedQuantity);
  const leastUsed = sortedByAccess.slice(-leastUsedQuantity).reverse();

  const RankingItem = ({ 
    item, 
    index, 
    type 
  }: { 
    item: FunctionalityData; 
    index: number; 
    type: 'most' | 'least';
  }) => (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 16px', 
        borderRadius: '8px', 
        backgroundColor: '#fafafa',
        border: '1px solid #f0f0f0',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.borderColor = '#d9d9d9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Tag 
          color={type === 'most' ? 'blue' : 'default'}
          style={{ 
            minWidth: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          {index + 1}
        </Tag>
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {item.percentualUsuarios}% usuários
          </Text>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.acessos}</Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>total acessos</Text>
      </div>
    </div>
  );

  return (
    <Row gutter={24}>
      {/* Most Used */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <TrophyOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Title level={4} style={{ margin: 0, color: '#262626', fontSize: '16px', fontWeight: 500 }}>Mais Acessadas</Title>
              </Space>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Quantidade:</Text>
                <Select
                  value={mostUsedQuantity}
                  onChange={(value) => setMostUsedQuantity(value)}
                  style={{ width: 70 }}
                  size="small"
                >
                  <Select.Option value={3}>3</Select.Option>
                  <Select.Option value={5}>5</Select.Option>
                  <Select.Option value={10}>10</Select.Option>
                  <Select.Option value={15}>15</Select.Option>
                  <Select.Option value={20}>20</Select.Option>
                  <Select.Option value={sortedByAccess.length}>Todos</Select.Option>
                </Select>
              </div>
            </div>
          }
          style={{ 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        >
          <div>
            {mostUsed.map((item, index) => (
              <RankingItem 
                key={item.name} 
                item={item} 
                index={index} 
                type="most" 
              />
            ))}
          </div>
        </Card>
      </Col>

      {/* Least Used */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                <Title level={4} style={{ margin: 0, color: '#262626', fontSize: '16px', fontWeight: 500 }}>Menos Acessadas</Title>
              </Space>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Quantidade:</Text>
                <Select
                  value={leastUsedQuantity}
                  onChange={(value) => setLeastUsedQuantity(value)}
                  style={{ width: 70 }}
                  size="small"
                >
                  <Select.Option value={3}>3</Select.Option>
                  <Select.Option value={5}>5</Select.Option>
                  <Select.Option value={10}>10</Select.Option>
                  <Select.Option value={15}>15</Select.Option>
                  <Select.Option value={20}>20</Select.Option>
                  <Select.Option value={sortedByAccess.length}>Todos</Select.Option>
                </Select>
              </div>
            </div>
          }
          style={{ 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        >
          <div>
            {leastUsed.map((item, index) => (
              <RankingItem 
                key={item.name} 
                item={item} 
                index={index} 
                type="least" 
              />
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}