import { Observable } from 'rxjs'
import {apiService} from './apiService'
import { Indicadores } from '@/interface/Indicadores';

export const LoadIndicadores = (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/Indicadores',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadNpsDetalhes = (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/detalhes-nps',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadUsuarioAtivosDetalhes = (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/usuarios-ativos',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadVarejoMaisEngajado = (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/detalhes-varejo-mais-engajado',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadMediaAcessos= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/media-acessos',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadMaisAcessada= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/mais-acessada',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}
export const LoadUtilizacaoPorFuncionalidade= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/utilizacao-por-funcionalidade',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadEvolucaoDiaria= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/evolucao-diaria-acesso',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadMaisAcessadosList= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/mais-acessados',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadRankingVarejo= (params:Indicadores): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/ranking-varejos',params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const LoadIndicadoresOperacionais = (params: any): Observable<any> => {
    return new Observable((observer) => {
        apiService.post('/Engajamento/indicadores-operacionais', params)
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}

export const ComboMenu= (): Observable<any> => {
    return new Observable((observer) => {
        apiService.get('/Menu/listar')
            .then((response: any) => {
                observer.next(response);
                observer.complete();
            })
            .catch((error: any) => {
                observer.error(error);
            });
    });
}
