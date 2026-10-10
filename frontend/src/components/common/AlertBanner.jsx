import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function AlertBanner({ type = 'error', message, onClose }) {
  if (!message) return null;

  const getIcon = () => {
    if (type === 'success') return <CheckCircle size={18} />;
    if (type === 'info') return <Info size={18} />;
    return <AlertCircle size={18} />;
  };

  return (
    <div className={`alert alert-${type}`}>
      {getIcon()}
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
