const axios = require('axios');
//axios=>基于Promise的HTTP客户端，用于浏览器和node.js
// 此处省略1万字，创建服务器.....
// 
// 
axios.get('http://localhost:8888')
.then(res=>{
  console.log(res.data);
})
.catch(err=>{
  console.log(err);
});