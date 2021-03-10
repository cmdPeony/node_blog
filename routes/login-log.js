const Router = require('koa-router')
const router = new Router({ prefix: '/loginLog'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { findAllLoginLog, deleteLoginLog } = require('../controllers/login-log')

const auth = jwt({ secret })

// 查找所有登录日志
router.get('/', auth, findAllLoginLog)

// 删除登录日志
router.delete('/:id', auth, deleteLoginLog)



module.exports = router