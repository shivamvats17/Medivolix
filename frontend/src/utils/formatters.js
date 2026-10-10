// Formatting utilities for dates, freshness thresholds, currency, and distances

export function formatDateTime(isoString) {
  if (!isoString) return 'Not recorded';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(isoString);
  }
}

export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(isoString);
  }
}

export function getFreshnessCategory(isoString, freshnessThresholdHours = 24) {
  if (!isoString) {
    return {
      status: 'UNKNOWN',
      label: 'Not Reported',
      badgeClass: 'badge-stale',
      isOutdated: true,
      hoursAgo: null,
    };
  }

  const updated = new Date(isoString);
  const now = new Date();
  const diffHours = (now - updated) / (1000 * 60 * 60);

  if (diffHours < 0 || diffHours <= 6) {
    return {
      status: 'FRESH',
      label: 'Verified Fresh (< 6h)',
      badgeClass: 'badge-available',
      isOutdated: false,
      hoursAgo: Math.max(0, Math.round(diffHours)),
    };
  }

  if (diffHours <= freshnessThresholdHours) {
    return {
      status: 'RECENT',
      label: `Recent (~${Math.round(diffHours)}h ago)`,
      badgeClass: 'badge-info',
      isOutdated: false,
      hoursAgo: Math.round(diffHours),
    };
  }

  return {
    status: 'OUTDATED',
    label: `Outdated (>24h ago)`,
    badgeClass: 'badge-stale',
    isOutdated: true,
    hoursAgo: Math.round(diffHours),
  };
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  const num = Number(km);
  if (isNaN(num)) return null;
  if (num < 1) {
    return `${Math.round(num * 1000)} m away`;
  }
  return `${num.toFixed(1)} km away`;
}
