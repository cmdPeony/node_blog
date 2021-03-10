// 文章类别
const { Schema, model}  = require('mongoose')
// 标签是三个
const sortScheme = new Schema({
  name: { // 标签名称
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  __v: {type:String, select: false},
  articles: { // 指向的文章
    type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    select: false,
  }
}, { timestamps: { createdAt: 'created', updatedAt: 'updated'}})

module.exports = model('ArticleTag', sortScheme)