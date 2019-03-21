const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session');
const render = require('koa-art-template');
const IO = require('koa-socket');
const Bodyparser = require('koa-bodyparser');
const Static = require('koa-static');
const Path = require('path');

let app = new Koa();
let router = Router();
const io = new IO();

global.mySessionStore = {};

global.group = {
    'male': '男生组',
    'female': '女生组',
    'all': '所有人'
};

function findKeyBySocketId(socketid) {
    for (var key in global.mySessionStore) {
        let obj = global.mySessionStore[key];
        if (obj.socketid === socketid) {
            return key;
        }
    }
}
function findObjBySocketId(socketid) {
    for (var temp in global.mySessionStore) {
        var obj = global.mySessionStore[temp];
        if (obj.socketid === socketid) {
            return obj;
        }
    }
}
//socketio 开始
io.attach(app);
//进行socket链接
io.on('connection', (ctx) => {
    io.broadcast('connResult', '连接成功!');
});
//聊天初始化
io.on('chat', (ctx) => {
    let id = ctx.data.id;
    if (global.mySessionStore[id]) {
        global.mySessionStore[id].socketid = ctx.socket.socket.id;
    };
    //服务器返回在线列表
    io.broadcast('online', {
        online: global.mySessionStore,
        group: global.group
    });
    //链接断开
    ctx.socket.on('disconnect', (ctx) => {
        let socketid = ctx.socket.socket.id;
        let key = findKeyBySocketId(socketid);
        delete global.mySessionStore[key];
        io.broadcast('online', {
            online: global.mySessionStore,
            group: global.group
        });
    });
});
//添加群组
io.on('addGroup', (ctx) => {
    let groupname = ctx.data;
    for (var key in global.group) {
        if (groupname !== global.group[key]) {
            global.group[groupname] = groupname;

            //服务器更新在线列表
            io.broadcast('online', {
                online: global.mySessionStore,
                group: global.group
            });
            return;
        }
    }
});
//加入群组
io.on('joinGroup', (ctx) => {
    let groupid = ctx.data.groupid;
    for (var key in global.group) {
        if (key === groupid) {
            ctx.socket.socket.join(groupid);
            return;
        }
    }
});
//发送消息
io.on('sendMsgs', (ctx) => {
    let { msgs, sendTo, senduser } = ctx.data;
    let sendSocketid = ctx.socket.socket.id;
    let { username } = findObjBySocketId(sendSocketid);
    if (senduser === username) {
        if (global.group[sendTo] && sendTo!='all') {
            app._io.to(sendTo).emit('sendMsgs', `来自 ${global.group[sendTo]} 组的 ${username} 说 : ${msgs} `);
            return;
        }
        if(sendTo =='all'){
            io.broadcast('sendMsgs', username + ': ' + msgs);
            return;
        }
        app._io.to(sendTo).emit('sendMsgs', `${username} 说 : ${msgs} `); 
    }
});

//socketio 结束
render(app, {
    root: Path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production'
});
router
    .get('/', async ctx => {
        ctx.render('login');
    })
    .post('/login', async ctx => {
        let { username, password } = ctx.request.body;
        ctx.session.users = {
            username,
            password
        }
        let id = Date.now();
        ctx.session.users.id = id;
        global.mySessionStore[id] = {
            username,
            password
        }
        ctx.redirect('/chat');
    })
    .get('/chat', async ctx => {
        ctx.render('chat', {
            username: ctx.session.users.username,
            id: ctx.session.users.id
        });
    })

app.keys = ['test']

let Store = {
    myStore: {},
    get: function (key) {
        return this.myStore[key];
    },
    set: function (key, session) {
        this.myStore[key] = session;
    },
    destory: function () {
        delete this.myStorep[key];
    }
}
app.use(Static(__dirname, 'public'));
app.use(session({ Store }, app));
app.use(Bodyparser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8888, () => {
    console.log('服务器启动成功!');
})
