const Router = require('koa-router')
const router = new Router({ prefix: '/article'})

const { secret } = require('../config/config')
const jwt = require('koa-jwt')
const { addArticle, updateArticleById, sendArticle, findAllArticles, sortArticle, addLoveVisitById, findNewArticles, findArticleById, deleteArticleById, checkSortAndTagsNums} = require('../controllers/article')

const auth = jwt({ secret })

// 查找所有文章
router.get('/', findAllArticles)

// 查找最新文章
router.get('/recent', findNewArticles)

// 统计数据
router.get('/count', sortArticle)

// 根据id请求文章 包括上一条跟下一条数据
router.get('/:id', findArticleById)

// 删除文章
router.delete('/:id', auth, deleteArticleById, sendArticle)

// 更新文章
router.patch('/:id', addLoveVisitById, auth, checkSortAndTagsNums, updateArticleById, sendArticle)

// 新增文章
router.post('/', auth, checkSortAndTagsNums, addArticle, sendArticle)

module.exports = router