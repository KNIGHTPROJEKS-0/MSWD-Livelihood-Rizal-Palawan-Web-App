import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Text,
  useToast
} from '@chakra-ui/react';
import { MSWDFormField } from '../types';
import { useMSWDWebstudio } from '../MSWDWebstudioProvider';

interface MSWDProgramFormProps {
  id: string;
  title: string;
  fields: MSWDFormField[];
  onSubmit?: (data: Record<string, any>) => void;
  editable?: boolean;
}

export const MSWDProgramForm: React.FC<MSWDProgramFormProps> = ({
  id,
  title,
  fields,
  onSubmit,
  editable = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { updateComponent } = useMSWDWebstudio();
  const toast = useToast();

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    onSubmit?.(formData);
    toast({
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully.',
      status: 'success',
      duration: 3000,
    });
  };

  const renderField = (field: MSWDFormField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            placeholder={`Select ${field.label}`}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          >
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        );
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleFieldChange(field.name, e.target.files?.[0])}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type="text"
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" bg="white" shadow="sm">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            mb={4}
            contentEditable={editable}
            onBlur={(e) => updateComponent(id, { title: e.target.textContent })}
          >
            {title}
          </Text>

          {fields.map((field) => (
            <FormControl key={field.name} isRequired={field.required}>
              <FormLabel>{field.label}</FormLabel>
              {renderField(field)}
            </FormControl>
          ))}

          <Button type="submit" colorScheme="blue" size="lg" mt={4}>
            Submit Application
          </Button>
        </VStack>
      </form>
    </Box>
  );
};