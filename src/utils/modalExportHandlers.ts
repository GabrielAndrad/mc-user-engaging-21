import { message } from 'antd';
import { 
  exportUserTableData, 
  exportNPSData, 
  exportAccessData, 
  exportRetailDetailData,
  exportFunctionalityData
} from './excelExport';

// Export handlers for modal components
export const createUserTableExportHandler = (userData: any[]) => {
  return () => {
    try {
      exportUserTableData(userData);
      message.success('Dados dos usuários exportados para Excel!');
    } catch (error) {
      message.error('Erro ao exportar dados de usuários.');
    }
  };
};

export const createNPSExportHandler = (npsDetails: any) => {
  return () => {
    try {
      exportNPSData(npsDetails);
      message.success('Dados NPS exportados para Excel!');
    } catch (error) {
      message.error('Erro ao exportar dados NPS.');
    }
  };
};

export const createAccessExportHandler = (accessData: any) => {
  return () => {
    try {
      exportAccessData(accessData);
      message.success('Dados de acesso exportados para Excel!');
    } catch (error) {
      message.error('Erro ao exportar dados de acesso.');
    }
  };
};

export const createRetailExportHandler = (retailName: string) => {
  return () => {
    try {
      exportRetailDetailData(retailName);
      message.success('Dados de varejo exportados para Excel!');
    } catch (error) {
      message.error('Erro ao exportar dados de varejo.');
    }
  };
};

export const createFunctionalityExportHandler = (functionality: any) => {
  return () => {
    try {
      // Mock functionality details for export
      const mockUsers = [
        {
          Name: 'João Silva',
          email: 'joao.silva@exemplo.com',
          type: 'varejo',
          account: 'Supermercado Extra',
          sessions: 15,
          totalTime: 120,
          averageTime: 8,
          lastAccess: new Date().toLocaleDateString('pt-BR')
        }
      ];
      
      exportFunctionalityData(functionality.Nome || 'Funcionalidade', mockUsers);
      message.success('Dados de funcionalidade exportados para Excel!');
    } catch (error) {
      message.error('Erro ao exportar dados de funcionalidade.');
    }
  };
};