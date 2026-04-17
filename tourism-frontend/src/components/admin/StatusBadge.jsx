import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'completed':
        return {
          bg: 'bg-ethiopian-green',
          text: 'text-white',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      case 'pending':
      case 'processing':
        return {
          bg: 'bg-ethiopian-yellow',
          text: 'text-ethiopian-blue',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return {
          bg: 'bg-ethiopian-red',
          text: 'text-white',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      case 'draft':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;