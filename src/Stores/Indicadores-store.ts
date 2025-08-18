import { ComboMenu, LoadEvolucaoDiaria, LoadRankingVarejo } from './../services/Indicadores-service';
import { createStore } from "luffie";
import { LoadIndicadores, LoadMaisAcessada, LoadMediaAcessos, LoadNpsDetalhes, LoadUsuarioAtivosDetalhes, LoadUtilizacaoPorFuncionalidade, LoadVarejoMaisEngajado } from "@/services/Indicadores-service";
import { createAndRegisterManagedStore } from "@/utils/managed-subscription-store";
import { message } from "antd";
import { Indicadores } from "@/interface/Indicadores";
import { ActiveUsersModal } from "@/components/analytics/ActiveUsersModal";
import { NpsDetalhes } from "@/interface/Nps";
import { UsuarioAtivoEngajamento } from "@/interface/UsuariosAtivos";
import { VarejoMaisEngajado } from "@/interface/VarejoMaisEngajado";
import { MediaAcessos } from "@/interface/mediaAcessos";
import { MaisAcessada } from "@/interface/MaisAcessado";

interface KPIData {
    totalActiveUsers: number;
    activeUsersPercentage: number;
    averageSessionTime: number;
    topFunctionality: ''
    topAccount: string;
    totalUsers: number;
    npsScore: number;
}

const initialData = {
    data: [],
    Isloading: false, // manter para retrocompatibilidade, mas não usar mais
    IsloadingIndicadores: false,
    IsloadingUsuariosAtivosDetalhes: false,
    IsloadingNpsDetalhes: false,
    IsloadingVarejoMaisEngajado: false,
    IsloadingMediaAcessos: false,
    IsloadingMaisAcessada: false,
    IsloadingUtilizacaoPorFuncionalidade: false,
    IsloadingEvolucaoDiaria: false,
    IsloadingRankingVarejo: false,
    IsloadingComboMenu: false,
    OpenActiveUsersModal: false,
    DataUsuariosAtivosDetalhes: [],
    OpenNpsModal: false,
    DataNpsDetalhes: null,
    OpenVarejoMaisEngajado: false,
    DataVarejoMaisEngajado: null,
    DataUtilizacaoPorFuncionalidade: [],
    DataEvolucaoDiaria: [],
    DataMediaAcessos: null,
    DataRankingVarejo: null,
    OpenMediaAcesso: false,
    ValuesFilters: {
        dataFim: new Date(),
        dataInicio: (() => {
            const today = new Date();
            const prevMonth = new Date(today);
            prevMonth.setMonth(today.getMonth() - 1);
            if (prevMonth.getDate() !== today.getDate()) {
                prevMonth.setDate(0);
            }
            return prevMonth;
        })(),
        funcionalidade: null,
        varejo: null,
        Nps: null,
        PeriodosRapidos: null
    },
    Combos: {
        funcionalidade: [],
        varejo: [],
        Nps: [],
        PeriodosRapidos: []
    },
    DataMaisAcessada: null,
    OpenMaisAcessada: false
};


function updateValuesFilters(dataIndex, value) {
    const currentState = getCurrentState();
    updateState({
        ValuesFilters: {
            ...currentState.ValuesFilters,
            [dataIndex]: value
        }
    });
}


const { state$, updateState, getCurrentState } = createStore(initialData);
const { createManagedSubscription, cleanupStoreSubscriptions, getStoreStats } =
    createAndRegisterManagedStore('IndicadoresStore');


const openCloseActiveUsersModal = (value) => { const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };
    if (!!value) {
        updateState({ IsloadingIndicadores: true })
        createManagedSubscription(
            LoadUsuarioAtivosDetalhes(Itens),
            (response: UsuarioAtivoEngajamento[]) => {
                updateState({ DataUsuariosAtivosDetalhes: response, IsloadingIndicadores: false, OpenActiveUsersModal: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataUsuariosAtivosDetalhes: [], IsloadingIndicadores: false })
            }
        )
    } else {
        updateState({ OpenActiveUsersModal: value })
    }

}

const LoadUserDetalhe = (params) => {

    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    const FimVigencia = params && params.FimVigencia ? params.FimVigencia : formatDate(today);
    const InicioVigencia = params && params.InicioVigencia ? params.InicioVigencia : formatDate(getOneMonthAgo(today));
    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.Funcionalidade ? params.Funcionalidade : [],
        Varejo: params && params.Varejo ? params.Varejo : [],
        Nps: params && params.Nps ? params.Nps : []
    }

    updateState({ IsloadingUsuariosAtivosDetalhes: true })
    createManagedSubscription(
        LoadUsuarioAtivosDetalhes(Itens),
        (response: UsuarioAtivoEngajamento[]) => {
            updateState({ DataUsuariosAtivosDetalhes: response, IsloadingUsuariosAtivosDetalhes: false})
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataUsuariosAtivosDetalhes: [], IsloadingUsuariosAtivosDetalhes: false })
        }
    )

}

const openCloseNpsModal = (value) => {
 const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };
    if (!!value) {
        updateState({ IsloadingIndicadores: true })
        createManagedSubscription(
            LoadNpsDetalhes(Itens),
            (response: NpsDetalhes) => {
                updateState({ DataNpsDetalhes: response, IsloadingIndicadores: false, OpenNpsModal: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataNpsDetalhes: [], IsloadingIndicadores: false })
            }
        )
    } else {
        updateState({ OpenNpsModal: value })
    }
}

const LoadIndicadoresEngajamento = (params) => {

    updateState({ IsloadingIndicadores: true })
    createManagedSubscription(
        LoadIndicadores(params),
        (response: KPIData[]) => {
            updateState({ data: response, IsloadingIndicadores: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ data: [], IsloadingIndicadores: false })
        }
    )
}


const openCloseVarejoMaisEngajado = (value) => {
 const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };
    if (!!value) {
        updateState({ IsloadingIndicadores: true })
        createManagedSubscription(
            LoadVarejoMaisEngajado(Itens),
            (response: VarejoMaisEngajado) => {
                updateState({ DataVarejoMaisEngajado: response, IsloadingIndicadores: false, OpenVarejoMaisEngajado: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataVarejoMaisEngajado: [], IsloadingIndicadores: false })
            }
        )
    } else {
        updateState({ OpenVarejoMaisEngajado: value })
    }
}

const openCloseMediaAcesso = (value) => {
 const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };
    if (!!value) {
        updateState({ IsloadingIndicadores: true })
        createManagedSubscription(
            LoadMediaAcessos(Itens),
            (response: MediaAcessos) => {
                updateState({ DataMediaAcessos: response, IsloadingIndicadores: false, OpenMediaAcesso: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataMediaAcessos: [], IsloadingIndicadores: false })
            }
        )
    } else {
        updateState({ OpenMediaAcesso: value })
    }
}

const openCloseFuncionalidadeMaisAcessada = (value) => {
 const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };
    if (!!value) {
        updateState({ IsloadingIndicadores: true })
        createManagedSubscription(
            LoadMaisAcessada(Itens),
            (response: MaisAcessada) => {
                updateState({ DataMaisAcessada: response, IsloadingIndicadores: false, OpenMaisAcessada: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataMaisAcessada: [], IsloadingIndicadores: false })
            }
        )
    } else {
        updateState({ OpenMaisAcessada: value })
    }
}

const UtilizacaoPorFuncionalidade = (Itens) => {

    updateState({ IsloadingUtilizacaoPorFuncionalidade: true })
    createManagedSubscription(
        LoadUtilizacaoPorFuncionalidade(Itens),
        (response: KPIData[]) => {
            updateState({ DataUtilizacaoPorFuncionalidade: response, IsloadingUtilizacaoPorFuncionalidade: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataUtilizacaoPorFuncionalidade: [], IsloadingUtilizacaoPorFuncionalidade: false })
        }
    )
}

const EvolucaoDiaria = (Itens) => {

    updateState({ IsloadingEvolucaoDiaria: true })
    createManagedSubscription(
        LoadEvolucaoDiaria(Itens),
        (response: KPIData[]) => {
            updateState({ DataEvolucaoDiaria: response, IsloadingEvolucaoDiaria: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataEvolucaoDiaria: [], IsloadingEvolucaoDiaria: false })
        }
    )
}

const RankingVarejo = (Itens) => {

    updateState({ IsloadingRankingVarejo: true })
    createManagedSubscription(
        LoadRankingVarejo(Itens),
        (response: KPIData[]) => {
            updateState({ DataRankingVarejo: response, IsloadingRankingVarejo: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataRankingVarejo: [], IsloadingRankingVarejo: false })
        }
    )
}

const LoadComboMenu = () => {

    updateState({ IsloadingComboMenu: true })
    createManagedSubscription(
        ComboMenu(),
        (response) => {
            updateState({ Combos: {...response,funcionalidade:response}, IsloadingComboMenu: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ Combos: null, IsloadingComboMenu: false })
        }
    )
}

const LoadIndicadoresAll = () => {
    const { ValuesFilters } = getCurrentState();
    const params = ValuesFilters;

    // Função para garantir o formato yyyy-mm-dd
    const formatDate = (date: Date | string) => {
        if (typeof date === 'string') {
            // Se já estiver no formato correto, retorna como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            // Caso contrário, tenta converter para Date
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
            return '';
        }
        return date.toISOString().slice(0, 10);
    };

    const today = new Date();

    const getOneMonthAgo = (date: Date) => {
        const prevMonth = new Date(date);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        if (prevMonth.getDate() !== date.getDate()) {
            prevMonth.setDate(0);
        }
        return prevMonth;
    };

    // Garantir que as datas estejam no formato yyyy-mm-dd
    const FimVigencia = params && params.dataFim ? formatDate(params.dataFim) : formatDate(today);
    const InicioVigencia = params && params.dataInicio ? formatDate(params.dataInicio) : formatDate(getOneMonthAgo(today));

    const Itens: Indicadores = {
        FimVigencia,
        InicioVigencia,
        Funcionalidade: params && params.funcionalidade ? [params.funcionalidade] : [],
        Varejo: params && params.varejo ? [params.varejo] : [],
        Nps: params && params.Nps ? [params.Nps] : []
    };

    LoadIndicadoresEngajamento(Itens);
    UtilizacaoPorFuncionalidade(Itens);
    EvolucaoDiaria(Itens);
    RankingVarejo(Itens);
    LoadUserDetalhe(Itens);
    LoadComboMenu();
}

export {
    state$ as IndicadoresState,
    LoadIndicadoresEngajamento,
    openCloseActiveUsersModal,
    openCloseNpsModal,
    openCloseVarejoMaisEngajado,
    openCloseMediaAcesso,
    openCloseFuncionalidadeMaisAcessada,
    UtilizacaoPorFuncionalidade,
    EvolucaoDiaria,
    RankingVarejo,
    LoadUserDetalhe,
    LoadComboMenu,
    updateValuesFilters,
    LoadIndicadoresAll
}