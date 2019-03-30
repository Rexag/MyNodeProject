const Koa = require('koa');

// 引入路由
const MusicRouter = require('./controllers/RouterMusic');
const userRouter = require('./controllers/RouterUser');
const formidable = require('koa-formidable');
const session = require('koa-session');
const checkLogin = require('./controllers/checklogin');
const render = require('koa-art-template');
const static = require('koa-static');

//创建服务器
let app = new Koa();

let { appPort, viewsDir, staticDir, uploadDir, rewriteUrlConfig } = require('./config');


//开启服务
app.listen(appPort, () => {
    console.log(`服务器启动在${appPort}端口`);
});

//模板渲染
render(app, {
    root: viewsDir,
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production',
    cache: false,
});

//中间件使用 app.use
let rewriteUrl = require('./controllers/rewrite');
let error = require('./controllers/error');
app.use(error());
//给static重写URL
app.use(rewriteUrl(rewriteUrlConfig));

//处理静态资源
app.use(static(staticDir));

let store = {
    storage: {},
    set(key, session) {
        this.storage[key] = session;
    },
    get(key) {
        return this.storage[key];
    },
    destroy(key) {
        delete this.storage[key];
    }
};

// 以 rexag 进行签名加密
app.keys = ['rexag'];

app.use(session({ store: store }, app));

//判断某些页面url是否有session上的url
app.use(checkLogin);

//必须在每次请求挂载新的数据与视图的桥梁（在session之后）
app.use(async (ctx, next) => {
    ctx.state.user = ctx.session.user;
    //最终全部放行
    await next();
});

// 1.这里最初使用formidable接收文件，但是头是键值对的头。所以formidable将数据解析键值对，打印出来的非常多。
// 2.使用bodyparser 也是键值对的头，解析的时候，里面包含文件，所以会报错（too large）请求体太大。
//处理文件
app.use(formidable({
    //设置上传目录，否则会存储在用户的temp目录下
    uploadDir: uploadDir,
    //默认根据文件算法生成hash字符串（文件名），无后缀
    keepExtensions: true
}));

app.use(userRouter.routes());
app.use(MusicRouter.routes());

//处理 405 方法不匹配     501   方法未实现
app.use(userRouter.allowedMethods());

//中间件使用  结束
