const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;

// Instantiates a client
// apiEndpoint regions available: eu-documentai.googleapis.com, us-documentai.googleapis.com (Required if using eu based processor)
// const client = new DocumentProcessorServiceClient({apiEndpoint: 'eu-documentai.googleapis.com'});
export const client = new DocumentProcessorServiceClient({
    keyFilename: './src/config/inbound-sight-388208-3c27aba16e30.json', // Path to your service account key file
  });