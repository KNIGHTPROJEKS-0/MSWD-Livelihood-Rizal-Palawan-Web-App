import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useMSWDWebstudio } from '../MSWDWebstudioProvider';
import { MSWDComponent, MSWDFormField } from '../types';

export const MSWDVisualEditor: React.FC = () => {
  const { config, addComponent, updateComponent, removeComponent } = useMSWDWebstudio();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedComponent, setSelectedComponent] = useState<MSWDComponent | null>(null);
  const [newField, setNewField] = useState<Partial<MSWDFormField>>({});

  const componentTypes = [
    { value: 'form', label: 'Program Form' },
    { value: 'card', label: 'Beneficiary Card' },
    { value: 'status', label: 'Status Badge' },
    { value: 'upload', label: 'Document Upload' }
  ];

  const handleAddComponent = (type: string) => {
    const newComponent: MSWDComponent = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      props: {
        title: `New ${type}`,
        ...(type === 'form' && { fields: [] })
      }
    };
    addComponent(newComponent);
  };

  const handleEditComponent = (component: MSWDComponent) => {
    setSelectedComponent(component);
    onOpen();
  };

  const handleSaveComponent = () => {
    if (selectedComponent) {
      updateComponent(selectedComponent.id, selectedComponent.props);
      onClose();
    }
  };

  const handleAddField = () => {
    if (selectedComponent && newField.name && newField.label) {
      const updatedFields = [
        ...(selectedComponent.props.fields || []),
        {
          name: newField.name,
          type: newField.type || 'text',
          label: newField.label,
          required: newField.required || false,
          options: newField.options || []
        }
      ];
      
      setSelectedComponent({
        ...selectedComponent,
        props: { ...selectedComponent.props, fields: updatedFields }
      });
      
      setNewField({});
    }
  };

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">MSWD Visual Editor</Text>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
            Add Component
          </Button>
        </HStack>

        <Box bg="white" p={4} borderRadius="md" shadow="sm">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>Components</Text>
          <VStack spacing={3} align="stretch">
            {config?.components.map((component) => (
              <HStack key={component.id} p={3} bg="gray.50" borderRadius="md">
                <Box flex={1}>
                  <Text fontWeight="medium">{component.props.title || component.type}</Text>
                  <Text fontSize="sm" color="gray.600">Type: {component.type}</Text>
                </Box>
                <IconButton
                  aria-label="Edit component"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => handleEditComponent(component)}
                />
                <IconButton
                  aria-label="Delete component"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => removeComponent(component.id)}
                />
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedComponent ? 'Edit Component' : 'Add Component'}
          </DrawerHeader>

          <DrawerBody>
            <Tabs>
              <TabList>
                <Tab>Properties</Tab>
                {selectedComponent?.type === 'form' && <Tab>Fields</Tab>}
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {!selectedComponent && (
                      <FormControl>
                        <FormLabel>Component Type</FormLabel>
                        <VStack spacing={2}>
                          {componentTypes.map(type => (
                            <Button
                              key={type.value}
                              w="full"
                              onClick={() => handleAddComponent(type.value)}
                            >
                              {type.label}
                            </Button>
                          ))}
                        </VStack>
                      </FormControl>
                    )}

                    {selectedComponent && (
                      <>
                        <FormControl>
                          <FormLabel>Title</FormLabel>
                          <Input
                            value={selectedComponent.props.title || ''}
                            onChange={(e) => setSelectedComponent({
                              ...selectedComponent,
                              props: { ...selectedComponent.props, title: e.target.value }
                            })}
                          />
                        </FormControl>

                        <Button colorScheme="blue" onClick={handleSaveComponent}>
                          Save Changes
                        </Button>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {selectedComponent?.type === 'form' && (
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="semibold">Form Fields</Text>
                      
                      {selectedComponent.props.fields?.map((field: MSWDFormField, index: number) => (
                        <Box key={index} p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="medium">{field.label}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {field.type} {field.required && '(Required)'}
                          </Text>
                        </Box>
                      ))}

                      <Box p={4} bg="blue.50" borderRadius="md">
                        <Text fontWeight="semibold" mb={3}>Add New Field</Text>
                        <VStack spacing={3}>
                          <FormControl>
                            <FormLabel>Field Name</FormLabel>
                            <Input
                              value={newField.name || ''}
                              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Field Label</FormLabel>
                            <Input
                              value={newField.label || ''}
                              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Field Type</FormLabel>
                            <Select
                              value={newField.type || 'text'}
                              onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                            >
                              <option value="text">Text</option>
                              <option value="select">Select</option>
                              <option value="file">File</option>
                              <option value="date">Date</option>
                              <option value="number">Number</option>
                            </Select>
                          </FormControl>
                          <Button colorScheme="green" onClick={handleAddField}>
                            Add Field
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};