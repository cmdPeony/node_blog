const ArticleTag = require('../models/article-tag')
const logger = require('../log/logger')

class ArticleTagCtrl {
  // 查询所有标签 记得分页
  async findAllArticleTags(ctx) {
    logger.info('查询所有标签, 未被删除的', ctx)
    const articletags = await ArticleTag.find()
    logger.info('所有标签', articletags)
    // ctx.body = '查找标签'
    ctx.body = {
      code: 200,
      result: articletags
    }
  }
  // 新增文章
  async addTag(ctx) {
    ctx.verifyParams({
      name: { // 文章名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      }
    })
    const { name } = ctx.request.body
    const tag = await ArticleTag.findOne({name})
    if(tag) {
      ctx.body = {
        code: 1006,
        message: '标签名称已经存在'
      }
    }
    await new ArticleTag({ name }).save()
    const tags = await ArticleTag.find()
    ctx.body = {
      code: 200,
      result: tags
    }
  }
}
module.exports = new ArticleTagCtrl()