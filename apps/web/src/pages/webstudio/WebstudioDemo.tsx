import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { 
  MSWDWebstudioProvider,
  MSWDBeneficiaryCard,
  MSWDProgramForm,
  MSWDStatusBadge,
  MSWDDocumentUpload,
  MSWDVisualEditor
} from '../../components/webstudio';
import { WebstudioConfig } from '../../components/webstudio/types';

const demoConfig: WebstudioConfig = {
  apiUrl: '/api/v1',
  components: [
    {
      id: 'livelihood-form',
      type: 'form',
      props: {
        title: 'Livelihood Assistance Application',
        fields: [
          { name: 'fullName', type: 'text', label: 'Full Name', required: true },
          { name: 'barangay', type: 'select', label: 'Barangay', required: true, options: ['Barangay 1', 'Barangay 2', 'Barangay 3'] },
          { name: 'businessType', type: 'select', label: 'Business Type', required: true, options: ['Sari-sari Store', 'Farming', 'Fishing', 'Other'] },
          { name: 'requestedAmount', type: 'number', label: 'Requested Amount (PHP)', required: true },
          { name: 'businessPlan', type: 'file', label: 'Business Plan Document', required: true }
        ]
      }
    }
  ],
  programs: [
    {
      id: 'livelihood',
      name: 'Livelihood Assistance Program',
      description: 'Financial assistance for small business development',
      fields: [
        { name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { name: 'barangay', type: 'select', label: 'Barangay', required: true, options: ['Barangay 1', 'Barangay 2'] }
      ]
    }
  ]
};

export const WebstudioDemo: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
  };

  const handleFileUpload = async (files: File[]) => {
    console.log('Files uploaded:', files);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <MSWDWebstudioProvider initialConfig={demoConfig}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color="blue.600" mb={2}>
              MSWD Webstudio Integration Demo
            </Text>
            <Text fontSize="lg" color="gray.600" mb={4}>
              Visual editing capabilities for MSWD forms and components
            </Text>
            <HStack justify="center" spacing={4}>
              <Button colorScheme="blue" onClick={onOpen}>
                Open Visual Editor
              </Button>
              <MSWDStatusBadge status="approved" />
            </HStack>
          </Box>

          <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
            <GridItem>
              <Text fontSize="xl" fontWeight="semibold" mb={4}>Beneficiary Cards</Text>
              <VStack spacing={4}>
                <MSWDBeneficiaryCard
                  id="card-1"
                  name="Maria Santos"
                  program="Livelihood Assistance"
                  status="approved"
                  dateApplied="2024-01-15"
                  editable={true}
                />
                <MSWDBeneficiaryCard
                  id="card-2"
                  name="Juan Dela Cruz"
                  program="Senior Citizen Support"
                  status="pending"
                  dateApplied="2024-01-20"
                  editable={true}
                />
              </VStack>
            </GridItem>

            <GridItem>
              <Text fontSize="xl" fontWeight="semibold" mb={4}>Dynamic Program Form</Text>
              <MSWDProgramForm
                id="demo-form"
                title="Livelihood Assistance Application"
                fields={[
                  { name: 'fullName', type: 'text', label: 'Full Name', required: true },
                  { name: 'barangay', type: 'select', label: 'Barangay', required: true, options: ['Barangay 1', 'Barangay 2', 'Barangay 3'] },
                  { name: 'businessType', type: 'select', label: 'Business Type', required: true, options: ['Sari-sari Store', 'Farming', 'Fishing'] },
                  { name: 'amount', type: 'number', label: 'Requested Amount (PHP)', required: true },
                  { name: 'startDate', type: 'date', label: 'Preferred Start Date', required: false }
                ]}
                onSubmit={handleFormSubmit}
                editable={true}
              />
            </GridItem>

            <GridItem>
              <Text fontSize="xl" fontWeight="semibold" mb={4}>Document Upload</Text>
              <MSWDDocumentUpload
                id="demo-upload"
                title="Required Documents"
                acceptedTypes={['.pdf', '.jpg', '.png', '.docx']}
                maxSize={5}
                onUpload={handleFileUpload}
              />
            </GridItem>
          </Grid>

          <Box bg="blue.50" p={6} borderRadius="lg">
            <Text fontSize="xl" fontWeight="semibold" mb={4}>Integration Features</Text>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <Box>
                <Text fontWeight="medium" color="blue.600">✓ Visual Form Builder</Text>
                <Text fontSize="sm" color="gray.600">Drag-and-drop form creation</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="blue.600">✓ Live Content Editing</Text>
                <Text fontSize="sm" color="gray.600">Click-to-edit components</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="blue.600">✓ Dynamic Components</Text>
                <Text fontSize="sm" color="gray.600">Reusable MSWD components</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="blue.600">✓ Real-time Preview</Text>
                <Text fontSize="sm" color="gray.600">See changes instantly</Text>
              </Box>
            </Grid>
          </Box>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>MSWD Visual Editor</ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <MSWDVisualEditor />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </MSWDWebstudioProvider>
  );
};