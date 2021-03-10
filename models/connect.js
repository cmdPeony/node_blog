const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/blog",  { useNewUrlParser: true,  useUnifiedTopology: true }).then(res => {
  // console.log('链接', res)
  console.log('数据库链接成功')
}).catch(err => {
  console.log('数据库链接失败', err)
});

mongoose.set('useFindAndModify', false)