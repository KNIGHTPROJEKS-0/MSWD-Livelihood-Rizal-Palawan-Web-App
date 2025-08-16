import React, { useRef, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  List,
  ListItem,
  IconButton,
  useToast,
  Progress
} from '@chakra-ui/react';
import { AttachmentIcon, DeleteIcon } from '@chakra-ui/icons';

interface MSWDDocumentUploadProps {
  id: string;
  title?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  onUpload?: (files: File[]) => void;
}

export const MSWDDocumentUpload: React.FC<MSWDDocumentUploadProps> = ({
  id,
  title = 'Upload Documents',
  acceptedTypes = ['.pdf', '.jpg', '.png', '.docx'],
  maxSize = 5,
  onUpload
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file size
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File Size Error',
        description: `Files must be smaller than ${maxSize}MB`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter(file => 
      !acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()))
    );
    if (invalidFiles.length > 0) {
      toast({
        title: 'File Type Error',
        description: `Only ${acceptedTypes.join(', ')} files are allowed`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload?.(files);
      toast({
        title: 'Upload Successful',
        description: `${files.length} file(s) uploaded successfully`,
        status: 'success',
        duration: 3000,
      });
      setFiles([]);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box p={4} borderWidth={2} borderStyle="dashed" borderRadius="md" bg="gray.50">
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        
        <Button
          leftIcon={<AttachmentIcon />}
          onClick={() => fileInputRef.current?.click()}
          colorScheme="blue"
          variant="outline"
        >
          Select Files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {files.length > 0 && (
          <Box w="full">
            <Text fontWeight="medium" mb={2}>Selected Files:</Text>
            <List spacing={2}>
              {files.map((file, index) => (
                <ListItem key={index} display="flex" alignItems="center" justifyContent="space-between">
                  <Text fontSize="sm">{file.name}</Text>
                  <IconButton
                    aria-label="Remove file"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                  />
                </ListItem>
              ))}
            </List>

            {uploading && <Progress size="sm" isIndeterminate mt={2} />}

            <Button
              colorScheme="green"
              onClick={handleUpload}
              isLoading={uploading}
              loadingText="Uploading..."
              mt={3}
              w="full"
            >
              Upload {files.length} File(s)
            </Button>
          </Box>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center">
          Accepted formats: {acceptedTypes.join(', ')} • Max size: {maxSize}MB per file
        </Text>
      </VStack>
    </Box>
  );
};