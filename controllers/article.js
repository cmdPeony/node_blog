const Article = require('../models/article')
const ArticleTag = require('../models/article-tag')
const ArticleSort = require('../models/article-sort')
const logger = require('../log/logger')

class ArticleCtrl {
  // 新增文章
  async addArticle(ctx, next) {
    ctx.verifyParams({
      title: { // 文章名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      content: { // 内容
        type: 'string',
        required: true,
        min: 1
      },
      flag: { // 打开方式
        type: 'enum',
        required: true,
        values: [0, 1]
      }
    })
    const { title, content, flag, sorts, tags, addTag } = ctx.request.body
    const tagArr = addTag.map(v => {
      return {
        name: v
      }
    })
    // 批量增加
    let tagObj = await ArticleTag.insertMany(tagArr)
    tagObj = tagObj.map(v => {
      return v._id
    })
    logger.info('标签纸', tagObj)
    const allTags = [...tags, ...tagObj]
    const backArticle = await new Article({ title, content, flag, sorts, tags: allTags, author: ctx.state.user._id }).save()
  //  分类保存
    sorts.forEach(async v => {
      const sort = await ArticleSort.findById(v).select('+articles')
      logger.info('编辑结果', sort)
      const flag = sort.articles.map(id => id.toString()).includes(backArticle._id)
      if (!flag) {
        sort.articles.push(backArticle._id)
        sort.save();
      }
      logger.info('保存结果', sort)
    })
    // 标签保存
    allTags.forEach(async v => {
      const tag = await ArticleTag.findById(v).select('+articles')
      logger.info('编辑结果', tag)
      const flag = tag.articles.map(id => id.toString()).includes(backArticle._id)
      if (!flag) {
        tag.articles.push(backArticle._id)
        tag.save();
      }
      logger.info('保存结果', tag)
    })
    await next()
  }
  // 修改文章
  async updateArticleById(ctx, next) {
    ctx.verifyParams({
      title: { // 文章名称
        type: 'string',
        required: true,
        min: 1,
        max: 30
      },
      content: { // 内容
        type: 'string',
        required: true,
        min: 1
      },
      flag: { // 打开方式
        type: 'enum',
        required: true,
        values: [0, 1]
      }
    })
    const { title, content, flag, sorts, tags } = ctx.request.body
    const article = await Article.findByIdAndUpdate(ctx.params.id, { title, content, flag, sorts, tags, author: ctx.state.user._id })
    // logger.info('差早的文章2222', article, ctx.params.id)
    if(!article) {
      ctx.body = {
        code: 1007,
        message: '文章不存在'
      }
    }
    sorts.forEach(async v => {
      const sort = await ArticleSort.findById(v).select('+articles')
      logger.info('编辑结果', sort)
      const flag = sort.articles.map(id => id.toString()).includes(ctx.params.id)
      logger.info('是否包干', flag)
      if (!flag) {
        sort.articles.push(ctx.params.id)
        sort.save();
        logger.info('保存分类文航', ctx.params.id)
      }
      logger.info('保存结果', sort)
    })
    // 标签保存
    tags.forEach(async v => {
      const tag = await ArticleTag.findById(v).select('+articles')
      logger.info('编辑结果', tag)
      const flag = tag.articles.map(id => id.toString()).includes(ctx.params.id)
      if (!flag) {
        tag.articles.push(ctx.params.id)
        tag.save();
      }
      logger.info('保存结果', tag)
    })
    await next()
  }
  // 删除文章 不是真的删除
  async deleteArticleById(ctx, next) {
    const article = await Article.findByIdAndUpdate(ctx.params.id, { status: 0 })
    if(!article) {
      ctx.body = {
        code: 1007,
        message: '文章不存在'
      }
    }
    await next()
  }
  
  // 根据id查询单个文章
  async findArticleById(ctx) {
    logger.info('查询单个文章', ctx.params.id)
    const article = await Article.findById(ctx.params.id).select('+sorts +tags').populate('sorts').populate('tags')
    const previous = await Article.find({ '_id': { '$lt': ctx.params.id }, status: 1 }).sort({_id: -1}).limit(1) //  根据id到序输出
    const next = await Article.find({ '_id': { '$gt': ctx.params.id }, status: 1}).sort({_id: 1}).limit(1) // 根据id正序输出
    if(!article) {
      ctx.body = {
        code: 1007,
        message: '文章不存在'
      }
    }
    if(!article.loves) {
      article.loves = 0
    }
    ctx.body = {
      code: 200,
      result: {
        article,
        previous,
        next
      }
    }
  }
  // 查询所有文章 记得分页
  async findAllArticles(ctx) {
    // sortId是分类的id， 根据分类id查文章数据
    const { pageSize = 10, currentPage = 1, startTime, endTime, title, sortId, tagId, time } = ctx.query;
    const curPage = Math.max(currentPage * 1, 1) - 1;
    const perPage = Math.max(pageSize * 1, 1);
    const endDate = new Date(endTime)
    const end = endDate.setDate(endDate.getDate()+1);
    const titleObj = {$regex: title, $options:'i'}
    logger.info('匹配数据', title)
    const obj = startTime ? {created: {$gte: new Date(startTime), $lt: new Date(end)}, title: titleObj, status: 1} : {title: titleObj, status: 1}
    if(!title) {
      delete obj.title
    }
    if(sortId) {
      // 差早包含相关id的文章
      obj.sorts = {
        $elemMatch: { $eq: sortId }
      }
    }
    if(tagId) {
      obj.tags = {
        $elemMatch: { $eq: tagId }
      }
    }
    if(time) {
      // 时间限制
      const start = new Date(time)
      // 时差 加八个小时
      const end = new Date(start.setMonth(start.getMonth() + 1))
      obj.created = {$gte: start, $lt: end}
    }
    const articles = await Article.find(obj).select('+sorts +tags').skip(curPage * perPage).limit(perPage).populate('author').populate('sorts').populate('tags').sort({created: 1})
    const total = await Article.countDocuments({...obj, status: 1})
    // logger.info('所有文章', articles)
    ctx.body = {
      code: 200,
      result: {
        articles,
        total
      }
    }
  }
  // 获取最新文章
  async findNewArticles(ctx) {
    const articles = await Article.find({status: 1}).skip(0).limit(10).select('-author')
    ctx.body = {
      code: 200,
      result: {
        articles
      }
    }
  }
  // 限制文章的标签跟分类数量
  async checkSortAndTagsNums(ctx, next) {
    const { sorts, tags } = ctx.request.body
    logger.info('分类数据', sorts)
    if(sorts.length > 3) {
      ctx.body = {
        code: 1001,
        message: '文章分类数量最多三个'
      }
    }
    if(tags.length > 5) {
      ctx.body = {
        code: 1003,
        message: '文章标签数量最多5个'
      }
    }
    await next()
  }
  // 点赞
  async addLoveVisitById(ctx, next) {
    const { loves = 0, visits = 0 } = ctx.request.body
    // logger.info()
    if(loves > 0) {
      const article = await Article.findOneAndUpdate({_id: ctx.params.id, status: 1}, {loves})
      logger.info('查找的文章', article)
      if(!article) {
        ctx.body = {
          code: 1007,
          message: '文章不存在'
        }
      }
      ctx.body = {
        code: 200,
        result: article
      }
    }
    if(visits > 0){
      const article = await Article.findOneAndUpdate({_id: ctx.params.id, status: 1}, {visits})
      logger.info('新增阅读的文章', article)
      if(!article) {
        ctx.body = {
          code: 1007,
          message: '文章不存在'
        }
      }
      ctx.body = {
        code: 200,
        result: article
      }
    }
    if(!visits && !loves) {
      await next()
    }
  }
  // 文章归档
  async sortArticle(ctx) {
    // 时间是正常的
    const rest = await Article.aggregate([
      {
        $match: {"status": {$eq: 1}}
      },
      {
        $project: {
          month: {
            $substr: ['$created', 5, 2] 
          },
          year: {
            $substr: ["$created", 0, 4] 
          }
        }
      },
      {
        $group: {
          _id:{year:'$year', month:'$month'},
          count: {$sum: 1}
        }
      },
      {
        $sort: {_id: 1}//根据date排序
      }
    ])
    ctx.body = {
      code: 200,
      result: rest
    }
  }
  // 返回文章数据
  async sendArticle(ctx) {
    const articles = await Article.find({status: 1}).select('+sorts +tags').skip(0).limit(10).populate('author').populate('sorts').populate('tags').sort({created: 1})
    const total = await Article.countDocuments({status: 1}) 
    // logger.info('所有文章', articles)
    ctx.body = {
      code: 200,
      result: {
        articles,
        total
      }
    }
  }
}
module.exports = new ArticleCtrl()