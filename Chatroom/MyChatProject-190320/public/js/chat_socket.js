//在线列表展示
socket.on('online', function (data) {

    var users = Object.values(data.online);
    var group = data.group;
    var listBox = document.getElementsByClassName('online-list')[0];
    //在线列表
    var html = '';
    for (var key in group) {
        var groupname = group[key];
        html += `<li class = ${key}>
        ${groupname}
        </li>`;
    }
    for (var i = users.length - 1; i >= 0; i--) {
        var u = users[i];
        if (document.getElementsByClassName('who-chat')[0]) {
            var senduser = document.getElementsByClassName('who-chat')[0];
            if (u.username ==senduser.innerHTML) {
                continue;
            }
        }
        html += `<li class = ${u.socketid}>
        ${u.username}
        </li>`;
    }
    listBox.innerHTML = html;
});

//消息显示
socket.on('sendMsgs', function (data) {
    var ul = document.getElementsByClassName('chat-list')[0];
    ul.innerHTML += '<li>' + data + '</li>';
});

//socket连接结果返回
socket.on('connResult', function (data) {
    console.log(data);
});