/**
 * Helper utility to slice items array for the current page and page size.
 *
 * @param {Array} items
 * @param {number} currentPage - 1-indexed page number
 * @param {number|string} pageSize - Number of items per page or 'All'
 * @returns {Array} Paginated subset of items
 */
export function paginateItems(items = [], currentPage = 1, pageSize = 10) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (pageSize === 'All' || pageSize === 0 || pageSize >= items.length) {
    return items;
  }
  const numericSize = Math.max(1, parseInt(pageSize, 10) || 10);
  const startIndex = (currentPage - 1) * numericSize;
  return items.slice(startIndex, startIndex + numericSize);
}
