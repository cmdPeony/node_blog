const Router = require('koa-router')
const router = new Router({ prefix: '/articleSort'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { addArticleSort, updateArticleSortById, sendArticle, findArticleSorts, deleteArticleSortById} = require('../controllers/article-sort')

const auth = jwt({ secret })

// 查找所有文章
router.get('/', findArticleSorts)

// 删除文章
router.delete('/:id', auth, deleteArticleSortById, sendArticle)

// 更新文章
router.patch('/:id', auth, updateArticleSortById, sendArticle)

// 新增文章
router.post('/', auth, addArticleSort, sendArticle)

module.exports = router