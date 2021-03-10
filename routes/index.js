const fs = require('fs')
const logger = require('../log/logger')
// 注册路由
module.exports = (app) => {
  fs.readdirSync(__dirname).forEach(file => {
    if(file === 'index.js') { return; }
    logger.info('文件', file)
    const route = require(`./${file}`)
    app.use(route.routes()).use(route.allowedMethods())
  })
}