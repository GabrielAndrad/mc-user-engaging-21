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
    Isloading: false,
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
    Filters:null,
    DataMaisAcessada: null,
    OpenMaisAcessada: false
};


const { state$, updateState, getCurrentState } = createStore(initialData);
const { createManagedSubscription, cleanupStoreSubscriptions, getStoreStats } =
    createAndRegisterManagedStore('IndicadoresStore');


const openCloseActiveUsersModal = (value) => {
    const params = null

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
    if (!!value) {
        updateState({ Isloading: true })
        createManagedSubscription(
            LoadUsuarioAtivosDetalhes(Itens),
            (response: UsuarioAtivoEngajamento[]) => {

                updateState({ DataUsuariosAtivosDetalhes: response, Isloading: false, OpenActiveUsersModal: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataUsuariosAtivosDetalhes: [], Isloading: false })
            }
        )
    } else {
        updateState({ OpenActiveUsersModal: value })
    }

}

const LoadUserDetalhe = () => {
    const params = null

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

        updateState({ Isloading: true })
        createManagedSubscription(
            LoadUsuarioAtivosDetalhes(Itens),
            (response: UsuarioAtivoEngajamento[]) => {

                updateState({ DataUsuariosAtivosDetalhes: response, Isloading: false})
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataUsuariosAtivosDetalhes: [], Isloading: false })
            }
        )

}

const openCloseNpsModal = (value) => {

    const params = null

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
    if (!!value) {
        updateState({ Isloading: true })
        createManagedSubscription(
            LoadNpsDetalhes(Itens),
            (response: NpsDetalhes) => {

                updateState({ DataNpsDetalhes: response, Isloading: false, OpenNpsModal: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataNpsDetalhes: [], Isloading: false })
            }
        )
    } else {
        updateState({ OpenNpsModal: value })
    }
}

const LoadIndicadoresEngajamento = (params?) => {

    // Garantir que InicioVigencia e FimVigencia sempre tenham valor (default: hoje)
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
    updateState({ Isloading: true })
    createManagedSubscription(
        LoadIndicadores(Itens),
        (response: KPIData[]) => {

            updateState({ data: response, Isloading: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ data: [], Isloading: false })
        }
    )
}


const openCloseVarejoMaisEngajado = (value) => {

    const params = null

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
    if (!!value) {
        updateState({ Isloading: true })
        createManagedSubscription(
            LoadVarejoMaisEngajado(Itens),
            (response: VarejoMaisEngajado) => {

                updateState({ DataVarejoMaisEngajado: response, Isloading: false, OpenVarejoMaisEngajado: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataVarejoMaisEngajado: [], Isloading: false })
            }
        )
    } else {
        updateState({ OpenVarejoMaisEngajado: value })
    }
}

const openCloseMediaAcesso = (value) => {

    const params = null

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
    if (!!value) {
        updateState({ Isloading: true })
        createManagedSubscription(
            LoadMediaAcessos(Itens),
            (response: MediaAcessos) => {

                updateState({ DataMediaAcessos: response, Isloading: false, OpenMediaAcesso: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataMediaAcessos: [], Isloading: false })
            }
        )
    } else {
        updateState({ OpenMediaAcesso: value })
    }
}

const openCloseFuncionalidadeMaisAcessada = (value) => {

    const params = null

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
    if (!!value) {
        updateState({ Isloading: true })
        createManagedSubscription(
            LoadMaisAcessada(Itens),
            (response: MaisAcessada) => {

                updateState({ DataMaisAcessada: response, Isloading: false, OpenMaisAcessada: value })
            }, (error) => {
                message.error('Erro ao carregar Indicadores');
                updateState({ DataMaisAcessada: [], Isloading: false })
            }
        )
    } else {
        updateState({ OpenMaisAcessada: value })
    }
}

const UtilizacaoPorFuncionalidade = (params?) => {

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
    updateState({ Isloading: true })
    createManagedSubscription(
        LoadUtilizacaoPorFuncionalidade(Itens),
        (response: KPIData[]) => {

            updateState({ DataUtilizacaoPorFuncionalidade: response, Isloading: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataUtilizacaoPorFuncionalidade: [], Isloading: false })
        }
    )
}

const EvolucaoDiaria = (params?) => {

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
    updateState({ Isloading: true })
    createManagedSubscription(
        LoadEvolucaoDiaria(Itens),
        (response: KPIData[]) => {

            updateState({ DataEvolucaoDiaria: response, Isloading: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataEvolucaoDiaria: [], Isloading: false })
        }
    )
}

const RankingVarejo = (params?) => {

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
    updateState({ Isloading: true })
    createManagedSubscription(
        LoadRankingVarejo(Itens),
        (response: KPIData[]) => {

            updateState({ DataRankingVarejo: response, Isloading: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ DataRankingVarejo: [], Isloading: false })
        }
    )
}

const LoadComboMenu = () => {

    updateState({ Isloading: true })
    createManagedSubscription(
        ComboMenu(),
        (response) => {
            updateState({ Filters: {...response,ComboMenu:response}, Isloading: false })
        }, (error) => {
            message.error('Erro ao carregar Indicadores');
            updateState({ Filters: [], Isloading: false })
        }
    )
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
    LoadComboMenu
}