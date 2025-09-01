export class FileManager {
  constructor() {
    this.isXlsx = false;
    this.xlsxFileLookup = new Map();
    this.fileData = new Map();
  }

  isFilledCell(cell) {
    return cell !== "" && cell != null;
  }

  async loadFileData(filename) {
    if (this.isXlsx && this.xlsxFileLookup.has(filename)) {
      try {
        if (typeof XLSX === "undefined") {
          console.warn("XLSX library not loaded");
          return "";
        }

        const workbook = XLSX.read(this.fileData.get(filename), {
          type: "base64",
        });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: "",
        });
        const filteredData = jsonData.filter((row) =>
          row.some(this.isFilledCell.bind(this)),
        );
        const headerRowIndex = this.findHeaderRow(filteredData);

        const csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
        return XLSX.utils.sheet_to_csv(csv, { header: 1 });
      } catch (error) {
        console.error("File processing error:", error);
        return "";
      }
    }
    return this.fileData.get(filename) || "";
  }

  findHeaderRow(filteredData) {
    const headerRowIndex = filteredData.findIndex(
      (row, index) =>
        row.filter(this.isFilledCell.bind(this)).length >=
        (filteredData[index + 1]?.filter(this.isFilledCell.bind(this)).length ||
          0),
    );
    return headerRowIndex === -1 || headerRowIndex > 25 ? 0 : headerRowIndex;
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
}
