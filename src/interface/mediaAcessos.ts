export interface DistribuicaoAcessosPorDiaSemana {
  DiaSemana: string;
  TotalAcessos: number;
  UsuariosUnicos: number;
  MediaPorUsuario: number;
}

export interface MediaAcessos {
  TotalAcessos: number;
  UsuariosUnicos: number;
  MediaAcessos: number;
  HorarioPico: string;
  DiaMaisAtivo: string;
  NpsScore: number;
  DistribuicaoAcessosPorDiaSemana: DistribuicaoAcessosPorDiaSemana[];
}
