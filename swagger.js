import swaggerAutogen from 'swagger-autogen';

const swaggerAutogenInstance = swaggerAutogen();

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

const doc = {
    info: {
        version: '1.0.0',
        title: 'Account Software API',
        description: 'Auto-generated Swagger documentation',
    },
    host: 'sbph7x24-8080.inc1.devtunnels.ms',
    basePath: '/',
    schemes: ['https'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json', 'multipart/form-data'],
};

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger file generated successfully!');
});