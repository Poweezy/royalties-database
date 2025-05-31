export const CONFIG = {
  API_BASE_URL: 'https://api.eswacaa.sz/royalties',
  WEBSOCKET_URL: 'wss://api.eswacaa.sz/ws',
  
  // Tax rates for different minerals
  TAX_RATES: {
    coal: 0.03,
    ironOre: 0.05,
    quarryProducts: 15, // E/m³
    preciousMinerals: 0.10
  },
  
  // System settings
  SETTINGS: {
    autoSaveInterval: 30000, // 30 seconds
    sessionTimeout: 1800000, // 30 minutes
    maxFileSize: 10485760, // 10MB
    supportedFormats: ['pdf', 'xlsx', 'csv', 'json']
  },
  
  // UI settings
  UI: {
    defaultPageSize: 25,
    animationDuration: 300,
    chartColors: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed']
  }
};
