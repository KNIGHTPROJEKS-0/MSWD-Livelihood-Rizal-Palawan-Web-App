import { WebflowClient } from 'webflow-api';

const webflowClient = new WebflowClient({
  accessToken: import.meta.env.VITE_WEBFLOW_ACCESS_TOKEN || '',
});

export default webflowClient;