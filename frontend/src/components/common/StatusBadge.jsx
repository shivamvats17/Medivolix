import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  let badgeClass = 'badge-info';
  let label = normalized;

  switch (normalized) {
    case 'CONFIRMED':
    case 'ACTIVE':
    case 'APPROVED':
    case 'AVAILABLE':
      badgeClass = 'badge-available';
      break;
    case 'PENDING':
      badgeClass = 'badge-low';
      break;
    case 'UNAVAILABLE':
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'REJECTED':
      badgeClass = 'badge-out';
      break;
    case 'CANCELLED':
    case 'DEPLETED':
    case 'OUTDATED':
      badgeClass = 'badge-stale';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-available';
      break;
    default:
      badgeClass = 'badge-info';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
