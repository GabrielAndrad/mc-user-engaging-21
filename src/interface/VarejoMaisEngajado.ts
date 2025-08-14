export interface TopFuncionalidade {
  Nome: string;
  Id: number;
  AccessCount: number;
  AccessCountPercente: number,
}

export interface VarejoMaisEngajado {
  TotalUsuarios: number;
  UsuariosAtivos: number;
  TaxaEngajamento: number;
  TempoMedioSessao: number;
  VarejoName:string;
  TopFuncionalidades: TopFuncionalidade[];
}
