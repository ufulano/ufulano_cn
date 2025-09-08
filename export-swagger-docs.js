#!/usr/bin/env node

/**
 * Swagger API文档导出工具
 * 用于导出项目中的Swagger API文档为多种格式
 */

const swaggerJSDoc = require('./server/node_modules/swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Swagger配置
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ufulano 社交网站 API 文档',
      version: '1.0.0',
      description: '基于 OpenAPI 3.0 的自动生成接口文档',
      contact: {
        name: 'Ufulano Team',
        email: 'contact@ufulano.cn'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      },
      {
        url: 'https://your-domain.com',
        description: '生产服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer Token认证'
        }
      }
    }
  },
  apis: ['./server/src/routes/*.js']
};

console.log('🚀 开始导出Swagger API文档...\n');

try {
  // 生成Swagger规范
  const swaggerSpec = swaggerJSDoc(options);
  
  // 导出为JSON格式
  const jsonPath = path.join(__dirname, 'swagger-api-docs.json');
  fs.writeFileSync(jsonPath, JSON.stringify(swaggerSpec, null, 2));
  console.log('✅ JSON格式导出成功: swagger-api-docs.json');
  
  // 导出为YAML格式
  try {
    const yaml = require('./server/node_modules/js-yaml');
    const yamlPath = path.join(__dirname, 'swagger-api-docs.yaml');
    fs.writeFileSync(yamlPath, yaml.dump(swaggerSpec));
    console.log('✅ YAML格式导出成功: swagger-api-docs.yaml');
  } catch (error) {
    console.log('⚠️  YAML导出跳过 (未安装js-yaml)');
    console.log('   安装命令: npm install js-yaml');
  }
  
  // 导出为Markdown格式
  const markdownPath = path.join(__dirname, 'swagger-api-docs.md');
  const markdownContent = generateMarkdownFromSwagger(swaggerSpec);
  fs.writeFileSync(markdownPath, markdownContent);
  console.log('✅ Markdown格式导出成功: swagger-api-docs.md');
  
  // 生成统计信息
  const stats = generateStats(swaggerSpec);
  console.log('\n📊 文档统计信息:');
  console.log(`   - API接口数量: ${stats.apiCount}`);
  console.log(`   - 标签分组: ${stats.tags.join(', ')}`);
  console.log(`   - 支持的方法: ${stats.methods.join(', ')}`);
  
  console.log('\n🎉 Swagger文档导出完成！');
  console.log('\n📖 使用说明:');
  console.log('   - JSON格式: 可用于API测试工具导入');
  console.log('   - YAML格式: 可用于其他文档工具');
  console.log('   - Markdown格式: 可直接在GitHub等平台查看');
  console.log('   - 在线文档: http://localhost:3000/api-docs');
  
} catch (error) {
  console.error('❌ 导出失败:', error.message);
  process.exit(1);
}

function generateMarkdownFromSwagger(spec) {
  let markdown = `# ${spec.info.title}\n\n`;
  markdown += `**版本**: ${spec.info.version}\n\n`;
  markdown += `**描述**: ${spec.info.description}\n\n`;
  
  if (spec.info.contact) {
    markdown += `**联系方式**: ${spec.info.contact.name} (${spec.info.contact.email})\n\n`;
  }
  
  if (spec.servers && spec.servers.length > 0) {
    markdown += `## 🌐 服务器地址\n\n`;
    spec.servers.forEach(server => {
      markdown += `- **${server.description}**: \`${server.url}\`\n`;
    });
    markdown += '\n';
  }
  
  // 认证说明
  if (spec.components && spec.components.securitySchemes) {
    markdown += `## 🔐 认证方式\n\n`;
    markdown += `本项目使用JWT Bearer Token进行身份认证。\n\n`;
    markdown += `在请求头中添加: \`Authorization: Bearer <your-token>\`\n\n`;
  }
  
  // 按标签分组API
  const paths = spec.paths || {};
  const tags = {};
  
  Object.keys(paths).forEach(path => {
    const pathObj = paths[path];
    Object.keys(pathObj).forEach(method => {
      const operation = pathObj[method];
      if (operation.tags && operation.tags.length > 0) {
        const tag = operation.tags[0];
        if (!tags[tag]) {
          tags[tag] = [];
        }
        tags[tag].push({
          path,
          method: method.toUpperCase(),
          operation
        });
      }
    });
  });
  
  Object.keys(tags).forEach(tag => {
    markdown += `## 📋 ${tag}\n\n`;
    
    tags[tag].forEach(api => {
      markdown += `### ${api.method} ${api.path}\n\n`;
      markdown += `**描述**: ${api.operation.summary || '无描述'}\n\n`;
      
      if (api.operation.description) {
        markdown += `**详细说明**: ${api.operation.description}\n\n`;
      }
      
      if (api.operation.security) {
        markdown += `**认证要求**: 需要JWT Token\n\n`;
      }
      
      if (api.operation.requestBody) {
        markdown += `**请求体**:\n\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(api.operation.requestBody, null, 2);
        markdown += '\n```\n\n';
      }
      
      if (api.operation.responses) {
        markdown += `**响应**:\n\n`;
        Object.keys(api.operation.responses).forEach(statusCode => {
          const response = api.operation.responses[statusCode];
          markdown += `- **${statusCode}**: ${response.description || '无描述'}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });
  });
  
  markdown += `## 🔗 相关链接\n\n`;
  markdown += `- [在线API文档](http://localhost:3000/api-docs)\n`;
  markdown += `- [项目主页](../README.md)\n`;
  markdown += `- [项目设计文档](./PROJECT_DESIGN.md)\n`;
  
  return markdown;
}

function generateStats(spec) {
  const paths = spec.paths || {};
  const tags = new Set();
  const methods = new Set();
  let apiCount = 0;
  
  Object.keys(paths).forEach(path => {
    const pathObj = paths[path];
    Object.keys(pathObj).forEach(method => {
      const operation = pathObj[method];
      if (operation.tags && operation.tags.length > 0) {
        apiCount++;
        operation.tags.forEach(tag => tags.add(tag));
        methods.add(method.toUpperCase());
      }
    });
  });
  
  return {
    apiCount,
    tags: Array.from(tags),
    methods: Array.from(methods)
  };
}
