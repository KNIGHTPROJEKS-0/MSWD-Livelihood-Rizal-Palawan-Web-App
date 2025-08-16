import webflowClient from './client';

export interface WebflowExtensionAPI {
  createMSWDComponent: (data: any) => Promise<any>;
  updateBeneficiaryData: (siteId: string, collectionId: string, data: any) => Promise<any>;
  publishSite: (siteId: string) => Promise<any>;
}

export const webflowExtension: WebflowExtensionAPI = {
  async createMSWDComponent(data) {
    // Create MSWD-specific components in Webflow
    return await webflowClient.components.create(data);
  },

  async updateBeneficiaryData(siteId, collectionId, data) {
    // Update beneficiary information in Webflow CMS
    return await webflowClient.collections.items.createItem(collectionId, {
      fieldData: data,
      isArchived: false,
      isDraft: false,
    });
  },

  async publishSite(siteId) {
    // Publish MSWD site updates
    return await webflowClient.sites.publish(siteId);
  },
};