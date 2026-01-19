export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

// =============================================================================
// CURRENCY INPUT HELPERS - For live formatting in form inputs
// =============================================================================
// These helpers separate the "display value" (formatted string) from the
// "data value" (clean integer) for currency inputs.

/**
 * Formats a number into Indonesian Rupiah display format.
 * Used for displaying formatted value in text inputs.
 * 
 * @param {number|string} value - The numeric value to format
 * @returns {string} - Formatted string like "Rp 10.000" or empty string if no value
 * 
 * Examples:
 *   formatRupiah(10000) => "Rp 10.000"
 *   formatRupiah("50000") => "Rp 50.000"
 *   formatRupiah(0) => "" (empty for better UX when clearing)
 *   formatRupiah("") => ""
 */
export const formatRupiah = (value) => {
  // Handle empty/null/undefined values - return empty string for clean input UX
  if (value === "" || value === null || value === undefined) return "";
  
  // Convert to number and handle NaN
  const numericValue = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(numericValue) || numericValue === 0) return "";
  
  // Format with Indonesian locale (uses dots as thousand separators)
  // Example: 10000 => "10.000"
  const formatted = new Intl.NumberFormat("id-ID").format(numericValue);
  
  return `Rp ${formatted}`;
};

/**
 * Parses a formatted Rupiah string back to a clean integer.
 * Used when updating the underlying form state.
 * 
 * @param {string} value - The formatted string to parse (e.g., "Rp 10.000")
 * @returns {number} - Clean integer value (e.g., 10000)
 * 
 * Examples:
 *   parseRupiah("Rp 10.000") => 10000
 *   parseRupiah("50.000") => 50000
 *   parseRupiah("abc") => 0
 *   parseRupiah("") => 0
 */
export const parseRupiah = (value) => {
  // If already a number, return it directly
  if (typeof value === "number") return value;
  
  // If empty or not a string, return 0
  if (!value || typeof value !== "string") return 0;
  
  // Remove everything except digits
  // This strips: "Rp ", dots, spaces, any other characters
  const digitsOnly = value.replace(/\D/g, "");
  
  // Parse to integer (returns 0 if empty string)
  return parseInt(digitsOnly, 10) || 0;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
export const getCategoryColor = (category) => {
  const colors = {
    Makanan: "bg-green-100 text-green-800",
    Transportasi: "bg-blue-100 text-blue-800",
    Lainnya: "bg-gray-100 text-gray-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};
