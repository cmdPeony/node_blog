const Router = require('koa-router')
const router = new Router({ prefix: '/friendLink'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { addFriendLink, updateFriendLinkById, deleteFriendLinkById, findFriendLinks} = require('../controllers/friend-link')

const auth = jwt({ secret })

// 查找所有友情链接
router.get('/', findFriendLinks)

// 删除友情链接
router.delete('/:id', auth, deleteFriendLinkById, findFriendLinks)

// 更新友情链接
router.patch('/:id', auth, updateFriendLinkById, findFriendLinks)

// 新增友情链接
router.post('/', auth, addFriendLink, findFriendLinks)

module.exports = router