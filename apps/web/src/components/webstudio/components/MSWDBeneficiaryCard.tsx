import React from 'react';
import { Box, Text, Badge, VStack, HStack } from '@chakra-ui/react';
import { useMSWDWebstudio } from '../MSWDWebstudioProvider';

interface MSWDBeneficiaryCardProps {
  id: string;
  name: string;
  program: string;
  status: 'pending' | 'approved' | 'rejected';
  dateApplied: string;
  editable?: boolean;
}

export const MSWDBeneficiaryCard: React.FC<MSWDBeneficiaryCardProps> = ({
  id,
  name,
  program,
  status,
  dateApplied,
  editable = false
}) => {
  const { updateComponent } = useMSWDWebstudio();

  const statusColors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red'
  };

  const handleEdit = (field: string, value: any) => {
    if (editable) {
      updateComponent(id, { [field]: value });
    }
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      shadow="sm"
      bg="white"
      _hover={{ shadow: 'md' }}
      cursor={editable ? 'pointer' : 'default'}
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <Text 
            fontWeight="bold" 
            fontSize="lg"
            contentEditable={editable}
            onBlur={(e) => handleEdit('name', e.target.textContent)}
          >
            {name}
          </Text>
          <Badge colorScheme={statusColors[status]}>
            {status.toUpperCase()}
          </Badge>
        </HStack>
        
        <Text 
          color="gray.600"
          contentEditable={editable}
          onBlur={(e) => handleEdit('program', e.target.textContent)}
        >
          Program: {program}
        </Text>
        
        <Text fontSize="sm" color="gray.500">
          Applied: {dateApplied}
        </Text>
      </VStack>
    </Box>
  );
};