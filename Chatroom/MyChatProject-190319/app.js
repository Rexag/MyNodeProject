const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const path = require('path');
const session = require('koa-session');
const bodyparser = require('koa-bodyparser');
const IO = require('koa-socket');
const render = require('koa-art-template');

let app = new Koa();
const io = new IO();
let router = new Router();


const group = {
    'male': '男生组',
    'female': '女生组'
};


//声明全局变量,在服务器中存储{session_i：用户数据}
global.mySessionStore = {};

function findkeyBySocketId(socketid) {
    for (var key in global.mySessionStore) {
        let obj = global.mySessionStore[key];
        if (obj.socketid === socketid) {
            return key;
        }
    }
}

function findBySocketId(socketid) {
    for (var tempstamp in global.mySessionStore) {
        let obj = global.mySessionStore[tempstamp];
        if (obj.socketid === socketid) {
            return obj;
        }
    }
}

//加入socket.io开始
io.attach(app); //附加到app，产生关联

io.on('connection', (context) => {
    console.log('链接上一个');
    io.broadcast('msg1', '我是服务器来的');
});

io.on('sendMsg', (context) => {
    //查找对象的用户
    let obj = findBySocketId(context.socket.socket.id);
    //广播给所有人
    io.broadcast('allmessage', obj.username + ' 对所有人说 ' + context.data.newContent);
});


io.on('chat', context => {
    let id = context.data.id;
    if(global.mySessionStore[id]){
        global.mySessionStore[id].socketid = context.socket.socket.id;
    }
    io.broadcast('online', {
        online: global.mySessionStore
    });
    //断开链接
    context.socket.on('disconnect', (context) => {
        //删除原本存在id的用户，获取到socketid
        console.log('disconnect执行了');
        let socketid = context.socket.socket.id;
        let key = findkeyBySocketId(socketid);
        //删除key
        delete global.mySessionStore[key];
        io.broadcast('online', {
            online: global.mySessionStore
        })
    })
})
//发送私人消息
io.on('sendPrivateMsg', context => {
    let { msg } = context.data;
    let toId = context.data.to;
    let fromSocketId = context.socket.socket.id;
    let { username } = findBySocketId(fromSocketId);
    app._io.to(toId).emit('allmessage', `${username}对你说：${msg}`);
})
//加入群组
io.on('joinGroup', context => {
    let groupId = context.data;
    context.socket.socket.join(groupId);
})
//发送群组消息
io.on('sendGroupMsg', context => {
    let {msg} = context.data;
    let groupid = context.data.groupTo;
    let fromSocketId = context.socket.socket.id;
    let { username } = findBySocketId(fromSocketId);
    app._io.to(groupid).emit('allmessage', `来自${group[groupid]} 的 ${username} 对大家说：${msg}`);

})
//加入socket.io结束


render(app, {
    //页面查找的目录
    root: path.join(__dirname, 'views'),
    //设置后缀名
    extname: '.html',
    // debug： false 则每次都压缩页面以及JS，包括混淆，静态数据不会实时更新
    debug: process.env.NODE_ENV !== 'production'
})


router
    .get('/', async ctx => {
        ctx.render('index');
    })
    .post('/login', async ctx => {

        let { username, password } = ctx.request.body;

        //不验证，直接挂载session
        ctx.session.user = {
            username
        }

        let id = Date.now();
        ctx.session.user.id = id;

        global.mySessionStore[id] = {
            username: username
        }
        //重定向到聊天室
        ctx.redirect('/chat');
    })
    .get('/chat', async ctx => {
        console.log(ctx.session,'ctx.session');

        ctx.render('chat', {
            username: ctx.session.user.username,
            id: ctx.session.user.id,
        });
    })

app.keys = ['test'];

let store = {
    myStore: {},
    get: function (key) {
        return this.myStore[key];
    },
    set: function (key, session) {
        this.myStore[key] = session;
    },
    destroy: function () {
        delete this.myStore[key];
    }
}

//处理静态资源
app.use(static(path.resolve('./public')));
//处理session
app.use(session({ store }, app));
//处理请求体数据
app.use(bodyparser());
//路由
app.use(router.routes());
//处理 405 501
app.use(router.allowedMethods());

app.listen(8888, () => {
    console.log('服务器启动成功!');
});
