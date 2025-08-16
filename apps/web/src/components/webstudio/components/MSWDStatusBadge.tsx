import React from 'react';
import { Badge } from '@chakra-ui/react';

interface MSWDStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  size?: 'sm' | 'md' | 'lg';
}

export const MSWDStatusBadge: React.FC<MSWDStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const statusConfig = {
    pending: { colorScheme: 'yellow', label: 'Pending Review' },
    approved: { colorScheme: 'green', label: 'Approved' },
    rejected: { colorScheme: 'red', label: 'Rejected' },
    processing: { colorScheme: 'blue', label: 'Processing' }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      colorScheme={config.colorScheme} 
      size={size}
      px={2}
      py={1}
      borderRadius="md"
    >
      {config.label}
    </Badge>
  );
};