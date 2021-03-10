const Router = require('koa-router')
const router = new Router()

router.get('/home', ctx => {
  ctx.body = '请求首页数据'
})

module.exports = router