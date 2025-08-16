import { Box, Button, VStack, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useWebflowSites } from '../../services/webflow';
import { webflowExtension } from '../../services/webflow/extension';

export const MSWDWebflowIntegration = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { data: sites, isLoading } = useWebflowSites();
  const toast = useToast();

  const handlePublishSite = async (siteId: string) => {
    setIsPublishing(true);
    try {
      await webflowExtension.publishSite(siteId);
      toast({
        title: 'Site Published',
        description: 'MSWD site has been successfully published',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: 'Failed to publish site',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <Text>Loading Webflow sites...</Text>;

  return (
    <Box p={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        MSWD Webflow Integration
      </Text>
      <VStack spacing={3}>
        {sites?.sites?.map((site) => (
          <Box key={site.id} p={3} border="1px" borderColor="gray.200" borderRadius="md" w="full">
            <Text fontWeight="medium">{site.displayName}</Text>
            <Button
              size="sm"
              colorScheme="blue"
              mt={2}
              isLoading={isPublishing}
              onClick={() => handlePublishSite(site.id)}
            >
              Publish Site
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};