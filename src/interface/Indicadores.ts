export interface Indicadores{
    FimVigencia: string;
    InicioVigencia: string;
    Funcionalidade: number[];
    Varejo: number[];
    Nps: number[];
    CsResponsavel?: string | null;
    TipoClienteId?: number | null;
  }