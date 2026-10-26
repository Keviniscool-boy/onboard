// 极小入口：加载配置并启动服务
const { startServer } = require('./service');

const PORT = process.env.PORT || 3000;
startServer(PORT);
console.log(`minimal-project listening on ${PORT}`);
