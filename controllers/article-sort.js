const ArticleSort = require('../models/article-sort')
const Article = require('../models/article')
const logger = require('../log/logger')

class ArticleSortCtrl {
  // 新增文章分类
  async addArticleSort(ctx, next) {
    ctx.verifyParams({
      name: { // 文章分类名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      }
    })
    const { name } = ctx.request.body
    const sort = await ArticleSort.findOne({name})
    if(sort) {
      ctx.body = {
        code: 1004,
        message: '文章分类名称已经存在'
      }
    } else {
      const total = await ArticleSort.countDocuments({});
      if(total >= 10) {
        ctx.body = {
          code: 1002,
          message: '文章分类对多10个'
        }
      }
      await new ArticleSort({ name, author: ctx.state.user._id }).save()
      await next()
    }
  }
  // 修改文章分类
  async updateArticleSortById(ctx, next) {
    ctx.verifyParams({
      name: { // 文章分类名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      }
    })
    const { name } = ctx.request.body
    let sort = await ArticleSort.findOne({name})
    if(sort && sort._id !== ctx.params.id) {
      ctx.body = {
        code: 1004,
        message: '文章分类名称已经存在'
      }
    } else {
      sort = await ArticleSort.findByIdAndUpdate(ctx.params.id, { name, author: ctx.state.user._id })
      if(!sort) {
        ctx.body = {
          code: 1005,
          message: '文章分类不存在'
        }
      } else {
        await next()
      }
    }
  }
  // 删除文章分类 同时删除对应的文章
  async deleteArticleSortById(ctx, next) {
    const sort = await ArticleSort.findByIdAndDelete(ctx.params.id)
    if(!sort) {
      ctx.throw(404, '文章分类不存在')
    }
    // 删除对应的分类
    sort.articles.forEach(async v => {
      const article = await Article.findById(v)
      const index = article.sorts.findIndex(i => i === ctx.params.id)
      article.splice(index, 1)
      article.save()
    })

    await next()
  }
  
  // 查询所有文章分类 最多10中分类？ 记得分页
  async findArticleSorts(ctx) {
    logger.info('查询所有文章分类', ctx)
    const { startTime, endTime, name } = ctx.query;
    const endDate = new Date(endTime)
    const end = endDate.setDate(endDate.getDate()+1);
    const nameObj = {$regex: name, $options:'i'}
    const obj = startTime ? {created: {$gte: new Date(startTime), $lt: new Date(end)}, name: nameObj} : {name: nameObj}
    if(!name) {
      delete obj.name
    }
    logger.info('查询名称', name)
    const sorts = await ArticleSort.find(obj).select('+articles')
    // count里面不加true表示统计所有符合条件的 家true表示统计skip跟limit后的
    logger.info('查询数量', sorts)
    const total = await ArticleSort.countDocuments(obj) 
    logger.info('所有文章分类', sorts)
    ctx.body = {
      code: 200,
      result: {
        sorts,
        total
      }
    }
  }
  // 返回文章数据给前台
  async sendArticle(ctx) {
    const sorts = await ArticleSort.find().populate('author')
    const total = await ArticleSort.countDocuments({});
    ctx.body = {
      code: 200,
      result: {
        sorts,
        total
      }
    }
  }
}
module.exports = new ArticleSortCtrl()