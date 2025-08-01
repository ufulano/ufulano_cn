/**
 * 数据库配置文件
 * 
 * 功能特性：
 * - MySQL连接配置：数据库连接参数
 * - 连接池管理：连接池配置和优化
 * - 日志配置：SQL查询日志记录
 * - 错误处理：数据库连接错误处理
 * 
 * 配置参数：
 * - host：数据库主机地址
 * - port：数据库端口号
 * - database：数据库名称
 * - username：数据库用户名
 * - password：数据库密码
 * - dialect：数据库类型（MySQL）
 * 
 * 连接池配置：
 * - max：最大连接数
 * - min：最小连接数
 * - acquire：获取连接超时时间
 * - idle：连接空闲超时时间
 */

const { Sequelize } = require('sequelize');

// 替换为你的数据库配置
const sequelize = new Sequelize('ufulano', 'ufulano', '81t8WhDnPYN6mchy', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log 
});

// 测试数据库连接
(async () => {
    try {
        await sequelize.authenticate();
        console.log('database.js 数据库连接成功');
    } catch (error) {
        console.error('database.js 数据库连接失败:', error);
    }
})();

module.exports = sequelize;
