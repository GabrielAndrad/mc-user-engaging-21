// Utility functions for number formatting and parsing

/**
 * Converts a string or number that may use comma as decimal separator to a proper number
 * @param value - The value to parse (e.g., "1,300", "1.300", 1.3, etc.)
 * @returns The parsed number
 */
export const parseDecimalValue = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Replace comma with dot for decimal parsing
    const normalizedValue = value.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

/**
 * Formats a number for display, handling decimal values properly
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export const formatDecimalValue = (value: any, decimals: number = 1): string => {
  const numValue = parseDecimalValue(value);
  return numValue.toFixed(decimals);
};