/**
 * Convert an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with title and key properties
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || !data.length) return '';
  
  // Create header row
  const headerRow = headers.map(header => `"${header.title}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Get the value for this cell
      let value = item[header.key];
      
      // Format the value if needed
      if (header.format) {
        value = header.format(value, item);
      }
      
      // Handle undefined or null values
      if (value === undefined || value === null) {
        value = '';
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Download data as a CSV file
 * @param {string} csvContent - CSV content to download
 * @param {string} fileName - Name of the file to download
 */
export const downloadCSV = (csvContent, fileName) => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Add link to document
  document.body.appendChild(link);
  
  // Click the link to download the file
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV and download it
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with title and key properties
 * @param {string} fileName - Name of the file to download
 */
export const exportToCSV = (data, headers, fileName) => {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, fileName);
};