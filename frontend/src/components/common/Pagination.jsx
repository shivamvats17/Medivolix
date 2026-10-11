import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';



/**
 * Pagination component with row counter badges, rows-per-page selector, and page navigation.
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 'All'],
  itemLabel = 'rows',
  showPageSize = true,
  id = 'pagination',
}) {
  const isAll = pageSize === 'All';
  const numericPageSize = isAll ? Math.max(1, totalItems) : Math.max(1, parseInt(pageSize, 10) || 10);
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / (isAll ? totalItems || 1 : numericPageSize));

  const startItem = totalItems === 0 ? 0 : (isAll ? 1 : (currentPage - 1) * numericPageSize + 1);
  const endItem = totalItems === 0 ? 0 : (isAll ? totalItems : Math.min(currentPage * numericPageSize, totalItems));

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSelect = (p) => {
    if (p !== currentPage && onPageChange) {
      onPageChange(p);
    }
  };

  const handleSizeChange = (e) => {
    const val = e.target.value === 'All' ? 'All' : parseInt(e.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(val);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-container" id={id} data-testid={id}>
      {/* Left: Row Counter Badge & Info */}
      <div className="pagination-info">
        <span className="badge badge-info" data-testid={`${id}-counter-badge`} style={{ fontWeight: 600 }}>
          {totalItems} total {itemLabel}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong>
        </span>
      </div>

      {/* Right: Page Size & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {showPageSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor={`${id}-pagesize`} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Rows per page:
            </label>
            <select
              id={`${id}-pagesize`}
              data-testid={`${id}-pagesize-select`}
              className="pagination-size-select"
              value={pageSize}
              onChange={handleSizeChange}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pagination-controls" aria-label="Pagination Navigation">
          <button
            type="button"
            className="pagination-btn"
            onClick={handlePrev}
            disabled={currentPage <= 1 || totalPages <= 1}
            aria-label="Previous Page"
            data-testid={`${id}-prev-btn`}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {!isAll && getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>
                  &hellip;
                </span>
              );
            }
            return (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => handlePageSelect(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                data-testid={`${id}-page-${p}`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-btn"
            onClick={handleNext}
            disabled={currentPage >= totalPages || totalPages <= 1}
            aria-label="Next Page"
            data-testid={`${id}-next-btn`}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
