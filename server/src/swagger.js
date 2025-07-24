const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ufulano 社交网站 API 文档',
      version: '1.0.0',
      description: '基于 OpenAPI 3.0 的自动生成接口文档'
    }
  },
  apis: ['./src/routes/*.js'], // 自动读取注释
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger; 