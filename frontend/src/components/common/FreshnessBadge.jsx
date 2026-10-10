import React from 'react';
import { getFreshnessCategory } from '../../utils/formatters';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FreshnessBadge({ lastUpdated }) {
  const freshness = getFreshnessCategory(lastUpdated);

  const getIcon = () => {
    if (freshness.status === 'FRESH') return <CheckCircle2 size={12} />;
    if (freshness.status === 'OUTDATED') return <AlertTriangle size={12} />;
    return <Clock size={12} />;
  };

  return (
    <span
      className={`badge ${freshness.badgeClass}`}
      title={lastUpdated ? `Last reported: ${new Date(lastUpdated).toLocaleString()}` : 'No update timestamp'}
    >
      {getIcon()}
      {freshness.label}
    </span>
  );
}
