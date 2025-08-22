import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
}

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
}

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

// Export to Excel
export const exportToExcel = (data: any[], options: ExcelExportOptions = {}) => {
  const { filename = 'dados_exportados', sheetName = 'Dados' } = options;
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(wb, finalFilename);
  alert(JSON.stringify(data));
};

// Export to CSV
export const exportToCSV = (data: any[], options: CSVExportOptions = {}) => {
  const { filename = 'dados_exportados', delimiter = ',' } = options;
  
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(delimiter),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(delimiter) 
          ? `"${value}"` 
          : value;
      }).join(delimiter)
    )
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${timestamp}.csv`;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

// Export to PDF
export const exportToPDF = (data: any[], options: PDFExportOptions = {}) => {
  const { filename = 'dados_exportados', title = 'Relatório', orientation = 'portrait' } = options;
  
  if (data.length === 0) return;
  
  const doc = new jsPDF(orientation);
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
  
  // Prepare table data
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header] || ''));
  
  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [71, 85, 105] }
  });
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  doc.save(`${filename}_${timestamp}.pdf`);
};

// Export multiple sheets to Excel
export const exportMultipleSheets = (sheets: { name: string; data: any[] }[], filename = 'relatorio_completo') => {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(wb, finalFilename);
};

// Specific export functions for each component

// Dashboard general export (FilterSection)
export const exportDashboardData = (kpiData: any, functionalityData: any[], timelineData: any[], retailData: any[]) => {
  const sheets = [
    { 
      name: 'KPIs', 
      data: [{
        'Total de Usuários Ativos': kpiData.totalActiveUsers,
        'Percentual de Usuários Ativos': `${kpiData.activeUsersPercentage}%`,
        'Tempo Médio de Sessão (min)': kpiData.averageSessionTime,
        'Funcionalidade Principal': kpiData.topFunctionality,
        'Conta Principal': kpiData.topAccount,
        'Score NPS': kpiData.npsScore,
        'Total de Usuários': kpiData.totalUsers
      }]
    },
    { 
      name: 'Funcionalidades', 
      data: functionalityData.map(item => ({
        'Funcionalidade': item.name,
        'Acessos': item.acessos,
        'Tempo Médio (min)': item.tempoMedio,
        'Percentual de Usuários': `${item.percentualUsuarios}%`
      }))
    },
    { 
      name: 'Timeline', 
      data: timelineData.map(item => ({
        'Data': item.date,
        'Total de Acessos': item.acessos,
        'Varejo': item.varejo,
        'Indústria': item.industria,
        'PhotoCheck': item.photocheck
      }))
    },
    { 
      name: 'Varejo', 
      data: retailData.map(item => ({
        'Nome': item.name,
        'Total de Acessos': item.totalAccess,
        'Tempo Médio (min)': item.averageTime,
        'Percentual de Usuários': `${item.userPercentage}%`,
        'Score de Engajamento': item.engagementScore,
        'Crescimento': `${item.growth > 0 ? '+' : ''}${item.growth}%`
      }))
    }
  ];
  
  exportMultipleSheets(sheets, 'dashboard_completo');
};

// Export user table data
export const exportUserTableData = (userData: any[]) => {
  const exportData = userData.map(user => ({
    'Nome': user.Nome,
    'E-mail': user.Email,
    'Conta (Varejo)': user.ClienteNome,
    'Funcionalidade': user.Funcionalidade,
    'Total de Acessos': user.TotalAcesso,
    'Último Acesso': user.UltimoAcesso
  }));
  alert(JSON.stringify(exportData));
  
  exportToExcel(exportData, { filename: 'tabela_usuarios', sheetName: 'Usuários' });
};

// Export NPS data
export const exportNPSData = (npsDetails: any) => {
  const summaryData = [{
    'Score NPS': npsDetails.npsScore,
    'Total de Respostas': npsDetails.TotalResponses,
    'Taxa de Resposta (%)': npsDetails.responseRate,
    'Promotores': npsDetails.Promoters,
    'Neutros': npsDetails.Passives,
    'Detratores': npsDetails.Detractors,
    'Percentual Promotores (%)': npsDetails.PromotersPercentage,
    'Percentual Neutros (%)': npsDetails.PassivesPercentage,
    'Percentual Detratores (%)': npsDetails.DetractorsPercentage
  }];
  
  const detailsData = npsDetails.DataNps ? npsDetails.DataNps.map((item: any) => ({
    'Cliente': item.ClienteNome,
    'Nota': item.Nota,
    'Comentário': item.Descricao || '',
    'Data': item.DataCadastro ? new Date(item.DataCadastro).toLocaleDateString('pt-BR') : ''
  })) : [];
  
  const sheets = [
    { name: 'Resumo NPS', data: summaryData },
    { name: 'Detalhes das Respostas', data: detailsData }
  ];
  
  exportMultipleSheets(sheets, 'dados_nps');
};

// Export access data
export const exportAccessData = (accessData: any) => {
  const summaryData = [{
    'Total de Acessos': accessData.TotalAcessos,
    'Usuários Únicos': accessData.UsuariosUnicos,
    'Horário Pico': accessData.HorarioPico,
    'Dia Mais Ativo': accessData.DiaMaisAtivo,
    'Média de Acessos': accessData.MediaAcessos
  }];
  
  const weeklyData = accessData.DistribuicaoAcessosPorDiaSemana
    ? accessData.DistribuicaoAcessosPorDiaSemana
        .filter((item: any) => item != null)
        .map((item: any) => ({
          'Dia da Semana': item.DiaSemana,
          'Total de Acessos': item.TotalAcessos,
          'Usuários Únicos': item.UsuariosUnicos,
          'Média por Usuário': item.MediaPorUsuario
        }))
    : [];
  
  const sheets = [
    { name: 'Resumo de Acessos', data: summaryData },
    { name: 'Distribuição Semanal', data: weeklyData }
  ];
  
  exportMultipleSheets(sheets, 'dados_acesso');
};

// Export functionality details
export const exportFunctionalityData = (functionality: string, users: any[]) => {
  const exportData = users.map(user => ({
    'Nome do Usuário': user.Name || user.name,
    'E-mail': user.email,
    'Tipo': user.type,
    'Conta (Varejo)': user.account,
    'Sessões': user.sessions,
    'Tempo Total (min)': user.totalTime,
    'Tempo Médio (min)': user.averageTime,
    'Último Acesso': user.lastAccess
  }));
  
  exportToExcel(exportData, { 
    filename: `funcionalidade_${functionality.toLowerCase().replace(/\s+/g, '_')}`, 
    sheetName: 'Detalhes da Funcionalidade' 
  });
};

// Export retail data
export const exportRetailDetailData = (retailName: string) => {
  // This would contain specific retail data - using mock data for now
  const mockRetailData = [
    {
      'Nome do Varejo': retailName,
      'Total de Usuários': Math.floor(Math.random() * 100) + 50,
      'Acessos Totais': Math.floor(Math.random() * 1000) + 500,
      'Tempo Médio de Sessão (min)': Math.floor(Math.random() * 60) + 15,
      'Funcionalidade Mais Usada': 'PhotoCheck',
      'Score de Engajamento': Math.floor(Math.random() * 100) + 1,
      'Crescimento Mensal (%)': (Math.random() * 40 - 20).toFixed(1)
    }
  ];
  
  exportToExcel(mockRetailData, { 
    filename: `varejo_${retailName.toLowerCase().replace(/\s+/g, '_')}`, 
    sheetName: 'Dados do Varejo' 
  });
};