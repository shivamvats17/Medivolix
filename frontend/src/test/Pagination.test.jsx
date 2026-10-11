import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../components/common/Pagination';
import { paginateItems } from '../utils/paginationUtils';

describe('Pagination Component', () => {
  it('renders total items counter badge and range information', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={45}
        pageSize={10}
        onPageChange={() => {}}
      />
    );

    const badge = screen.getByTestId('pagination-counter-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('45 total rows');
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('1–10')).toBeInTheDocument();
  });

  it('triggers onPageChange when page button or next button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={50}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    const nextBtn = screen.getByTestId('pagination-next-btn');
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    const page3Btn = screen.getByTestId('pagination-page-3');
    fireEvent.click(page3Btn);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={20}
        pageSize={10}
        onPageChange={() => {}}
      />
    );

    const prevBtn = screen.getByTestId('pagination-prev-btn');
    expect(prevBtn).toBeDisabled();
  });

  it('triggers onPageSizeChange when rows-per-page selector changes', () => {
    const handlePageSizeChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={100}
        pageSize={10}
        onPageChange={() => {}}
        onPageSizeChange={handlePageSizeChange}
      />
    );

    const select = screen.getByTestId('pagination-pagesize-select');
    fireEvent.change(select, { target: { value: '25' } });
    expect(handlePageSizeChange).toHaveBeenCalledWith(25);
  });
});

describe('paginateItems Utility', () => {
  const sampleItems = Array.from({ length: 35 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('slices correctly for page 1 with page size 10', () => {
    const paginated = paginateItems(sampleItems, 1, 10);
    expect(paginated).toHaveLength(10);
    expect(paginated[0].id).toBe(1);
    expect(paginated[9].id).toBe(10);
  });

  it('slices correctly for page 4 (last partial page)', () => {
    const paginated = paginateItems(sampleItems, 4, 10);
    expect(paginated).toHaveLength(5);
    expect(paginated[0].id).toBe(31);
    expect(paginated[4].id).toBe(35);
  });

  it('returns all items when pageSize is "All"', () => {
    const paginated = paginateItems(sampleItems, 1, 'All');
    expect(paginated).toHaveLength(35);
  });
});
