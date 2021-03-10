const Router = require('koa-router')
// 路由前缀
const router = new Router({ prefix: '/user'})
const {secret} = require('../config/config')
const jwt = require('koa-jwt')
const { findAllUsers, findUserById,deleteUserById, updateUserById, addUser,getClientIp, login, checkUserExist} = require('../controllers/user')
const { addLoginLog } = require('../controllers/login-log')
const auth = jwt({ secret })
// 请求所有用户 管理员权限
router.get('/', auth, findAllUsers)

// 根据id请求用户
router.get('/:id', auth, findUserById)

// 删除用户
router.delete('/:id', auth, deleteUserById)

// 更新用户
router.patch('/:id', auth, updateUserById)

// 新增用户
router.post('/', auth, addUser)

// 用户登录
router.post('/login', getClientIp, checkUserExist, addLoginLog, login)

module.exports = router