import { useQuery } from '@tanstack/react-query';
import webflowClient from './client';

export const useWebflowSites = () => {
  return useQuery({
    queryKey: ['webflow-sites'],
    queryFn: () => webflowClient.sites.list(),
  });
};

export const useWebflowCollections = (siteId: string) => {
  return useQuery({
    queryKey: ['webflow-collections', siteId],
    queryFn: () => webflowClient.collections.list(siteId),
    enabled: !!siteId,
  });
};