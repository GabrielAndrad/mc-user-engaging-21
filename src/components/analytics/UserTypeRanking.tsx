import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trophy, Star, Users, Building2, ShoppingCart, Camera } from 'lucide-react';

interface DetailedRankingData {
  Id:number;
  Nome: string;
  TotalAcessos: number;
  ScoreEngajamento: number;
  QuantidadeUsuarios?: number;
}

interface UserTypeRankingProps {
  varejoData: DetailedRankingData[];
  industriaData: DetailedRankingData[];
  photocheckData: DetailedRankingData[];
}

export function UserTypeRanking({ varejoData, industriaData, photocheckData }: UserTypeRankingProps) {
  const [itemsToShow, setItemsToShow] = useState<number>(5);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Use only varejo data
  const currentData = varejoData;

  // Sort data
  const sortedData = [...currentData].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.ScoreEngajamento - a.ScoreEngajamento;
    }
    return a.ScoreEngajamento - b.ScoreEngajamento;
  });

  // Limit data
  const displayData = sortedData.slice(0, itemsToShow);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Star className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Star className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Alto</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Médio</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Baixo</Badge>;
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'varejo':
        return <ShoppingCart className="w-4 h-4" />;
      case 'industria':
        return <Building2 className="w-4 h-4" />;
      case 'photocheck':
        return <Camera className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };


  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Ranking dos Varejos
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Quantidade:</label>
            <Select value={itemsToShow === currentData.length ? 'all' : itemsToShow.toString()} onValueChange={(value) => setItemsToShow(value === 'all' ? currentData.length : Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Ordenação:</label>
            <div className="flex gap-2">
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
                className="flex items-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                Maior
              </Button>
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
                className="flex items-center gap-1"
              >
                <TrendingDown className="w-4 h-4" />
                Menor
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {displayData.map((userType, index) => (
            <div
              key={userType.Id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {getRankIcon(index)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{userType.Nome}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{userType.TotalAcessos.toLocaleString()} acessos</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {userType.ScoreEngajamento}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score Engajamento
                  </div>
                </div>

              

                <div className="text-right">
                  <div className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {userType.QuantidadeUsuarios.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Usuários
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {getEngagementBadge(userType.ScoreEngajamento)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum tipo de usuário encontrado com os filtros aplicados.
          </div>
        )}
      </CardContent>
    </Card>
  );
}