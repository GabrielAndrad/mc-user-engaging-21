export interface NpsDetalhes {
  TotalResponses: number;
  Promoters: number;
  npsScore: any;
  Passives: number;
  Detractors: number;
  PromotersPercentage: number;
  PassivesPercentage: number;
  DetractorsPercentage: number;
  responseRate: number;
  DataNps: {
    NpsId: number;
    Nota: number;
    TipoNpsId: number;
    Descricao: string;
    ClienteId: number;
    ClienteNome: string;
    Ativo: boolean;
    DataCadastro: string;
  }[];
}
