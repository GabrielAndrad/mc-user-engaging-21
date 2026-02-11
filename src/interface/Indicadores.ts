export interface Indicadores{
    FimVigencia: string;
    InicioVigencia: string;
    Funcionalidade: number[];
    Varejo: number[];
    Nps: number[];
    usuarioId?: number | string | null;
    TipoClienteId?: number | null;
  }