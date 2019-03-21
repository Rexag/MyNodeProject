// socket.on('msg1', function (data) {
//     console.log(data);
// });
// socket.on('disconnect', function () {
//     console.log('断开链接了');
// });

//获取实时在线列表
socket.on('online', function (data) {
    // data 是一个sessionStore  {121221:{username:'xxx',socketid:xxx} ,121221:{username:'xxx',socketid:xxx}  }
    // 把该对象转换成数组
    console.log(data);
    var users = Object.values(data.online);
    //展示在线人数
    document.getElementById('online').innerHTML = users.length;

    //在线列表
    var select = document.getElementById('towho');
    var html;
    for(var i = users.length-1;i>=0;i--){
        var u = users[i];
        html+=`<option value="${u.socketid}">
        ${u.username}
        </option>`;
    }
    select.innerHTML = html;
});

socket.on('allmessage',function(data){
    var ul = document.getElementById('newsUl');
    ul.innerHTML+='<li>'+data+'</li>';
})