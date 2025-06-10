export class FileManager {
  constructor() {
    this.isXlsx = false;
    this.xlsxFileLookup = new Map();
    this.fileData = new Map();
  }

  isFilledCell(cell) {
    return cell !== '' && cell != null;
  }

  async loadFileData(filename) {
    if (this.isXlsx && this.xlsxFileLookup.has(filename)) {
      try {
        if (typeof XLSX === 'undefined') {
          console.warn('XLSX library not loaded');
          return "";
        }

        const workbook = XLSX.read(this.fileData.get(filename), { type: 'base64' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
        const filteredData = jsonData.filter(row => row.some(this.isFilledCell.bind(this)));
        const headerRowIndex = this.findHeaderRow(filteredData);

        const csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
        return XLSX.utils.sheet_to_csv(csv, { header: 1 });
      } catch (error) {
        console.error('File processing error:', error);
        return "";
      }
    }
    return this.fileData.get(filename) || "";
  }

  findHeaderRow(filteredData) {
    const headerRowIndex = filteredData.findIndex((row, index) =>
      row.filter(this.isFilledCell.bind(this)).length >= (filteredData[index + 1]?.filter(this.isFilledCell.bind(this)).length || 0)
    );
    return (headerRowIndex === -1 || headerRowIndex > 25) ? 0 : headerRowIndex;
  }

  setFileData(filename, data, isXlsx = false) {
    this.fileData.set(filename, data);
    if (isXlsx) {
      this.isXlsx = true;
      this.xlsxFileLookup.set(filename, true);
    }
  }

  getFileData(filename) {
    return this.fileData.get(filename);
  }

  hasFile(filename) {
    return this.fileData.has(filename);
  }

  removeFile(filename) {
    this.fileData.delete(filename);
    this.xlsxFileLookup.delete(filename);
  }

  clear() {
    this.fileData.clear();
    this.xlsxFileLookup.clear();
    this.isXlsx = false;
  }

  async exportToCSV(data, filename) {
    try {
      const csvContent = this.convertToCSV(data);
      this.downloadFile(csvContent, filename + '.csv', 'text/csv');
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  async exportToExcel(data, filename) {
    try {
      if (typeof XLSX === 'undefined') {
        throw new Error('XLSX library not loaded');
      }
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, filename + '.xlsx');
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
