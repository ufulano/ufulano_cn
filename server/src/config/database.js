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
