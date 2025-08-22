import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
}

export const exportToExcel = (data: any[], options: ExcelExportOptions = {}) => {
  const { filename = 'dados_exportados', sheetName = 'Dados' } = options;
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, finalFilename);
};

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