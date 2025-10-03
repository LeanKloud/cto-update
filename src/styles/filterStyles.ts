// Standardized filter styles for consistent UI across all recommendation pages

export const FILTER_STYLES = {
  // Standard filter input/select styling - dark theme
  input: "appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 pr-8 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent w-48 h-11 text-sm",
  
  // Standard filter container styling
  container: "relative flex-shrink-0",
  
  // Standard filter wrapper styling - improved for better alignment
  wrapper: "flex items-center space-x-3 flex-wrap gap-y-2",
  
  // Standard filter section styling - dark theme
  section: "bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 mb-6",
  
  // Standard filter section header styling
  sectionHeader: "flex items-center justify-between mb-4",
  
  // Standard filter count styling - dark theme
  count: "text-sm text-slate-400",
  
  // Standard chevron icon styling - dark theme
  chevron: "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none",
  
  // Responsive filter wrapper for mobile
  wrapperResponsive: "flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3",
  
  // Filter button styling - dark theme
  button: "px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200 font-medium h-11 text-sm",
  
  // Filter button container
  buttonContainer: "flex items-center space-x-3 flex-shrink-0"
} as const;

// Filter width variants for different use cases
export const FILTER_WIDTHS = {
  small: "min-w-[140px]",
  medium: "min-w-[180px]", 
  large: "min-w-[220px]",
  extraLarge: "min-w-[260px]"
} as const;

// Common filter placeholder text
export const FILTER_PLACEHOLDERS = {
  department: "Department",
  application: "Application", 
  cloudProvider: "Cloud Provider",
  cloudAccount: "Cloud Account Type",
  assetStatus: "Asset Status",
  assetType: "Asset Type",
  database: "Database Type",
  recommendationView: "All Recommendations"
} as const;


