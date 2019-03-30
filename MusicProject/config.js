const path = require('path');

module.exports = {
    viewsDir:path.resolve('./views/layout'),
    staticDir:path.resolve('./public'),
    uploadDir:path.resolve('./public/files'),
    appPort:8888,
    dbConfig:{
        connectionLimit:10,
        host:'127.0.0.1',
        port:'3396',
        user:'root',
        password:'0909',
        database:'rexag'
    },
    rewriteUrlConfig:[
        {
            regex:/\/abc/,dist:'/user/login'
        },
        {
            regex:/\/public(.*)/,dist:null
        },
        {
            src:'/',dist:'user/login'
        }
    ]
}