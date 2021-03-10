const koa = require('koa')
// 静态资源访问
const static = require('koa-static')
const path = require('path')
const routing = require('./routes/index')
// 全局错误处理中间件
const error = require('koa-json-error')
// form表单上传
const koaBody = require('koa-body')
// 参数校验
const parameter = require('koa-parameter')
// 打印请求信息的
const morgan = require('morgan');

const app = new koa()
// 数据库
require('./models/connect.js')

// 处理静态资源访问
app.use(static(path.join(__dirname, 'public')))

// 获取系统环境变量 返回值是对象 
if (process.env.NODE_ENV == 'development') {
	// 当前是开发环境
	console.log('当前是开发环境')
	// 在开发环境中 将客户端发送到服务器端的请求信息打印到控制台中
	app.use(morgan('dev'))
} else {
	// 当前是生产环境
	console.log('当前是生产环境')
}

// 全局错误处理
app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? {
    code: rest.status,
    message: rest.message,
    name: rest.name
  } : { 
    code: rest.status,
    message: rest.message,
    name: rest.name,
    stack
   }
}));

// 表单数据处理
app.use(koaBody({
  multipart:true, // 支持文件上传
  strict:false,//设为false  支持解析GET，HEAD，DELETE请求
  formidable:{
    uploadDir: path.join(__dirname,'public/upload/'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 20 * 1024 * 1024 // 文件上传大小
  }
}))

// 处理参数校验
app.use(parameter(app))
// 处理路由
routing(app)

app.listen(3000, () => {
  console.log('程序启动在3000端口了')
})