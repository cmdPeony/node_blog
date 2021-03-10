const Router = require('koa-router')
const router = new Router({ prefix: '/articleTag'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { findAllArticleTags, addTag } = require('../controllers/article-tag')

const auth = jwt({ secret })

// 查找所有文章
router.get('/', findAllArticleTags)

// 新增文章
router.post('/', auth, addTag)

module.exports = router