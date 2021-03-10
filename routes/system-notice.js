const Router = require('koa-router')
const router = new Router({ prefix: '/systemNotice'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { addSystemNotice, updateSystemNoticeById, sendNotice, findEffectNotice, deleteSystemNoticeById, findSystemNotices, checkSystemNoticeStatus, updateSystemNoticeStatus } = require('../controllers/system-notice')

const auth = jwt({ secret })

// 查找所有系统公告
router.get('/', auth, findSystemNotices)

// 查找生效的系统公告
router.get('/home', findEffectNotice)

// 删除系统公告
router.delete('/:id', auth, deleteSystemNoticeById, sendNotice)

// 更新系统公告内容
router.patch('/:id', auth, updateSystemNoticeById, sendNotice)

// 更新系统公告状态
router.patch('/:id/status', auth, checkSystemNoticeStatus, updateSystemNoticeStatus, sendNotice)

// 新增系统公告
router.post('/', auth, addSystemNotice, sendNotice)

module.exports = router