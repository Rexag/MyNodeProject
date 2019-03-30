const db = require('./db');

module.exports = {
    // xxx:()=> db.q(ssxx);
    registerUser: async (...user) => await db.q('insert into users (username,password,email,phone,sex) values (?,?,?,?,?)', user),
    quersyUsers: async () => await db.q('select * from users', []),
    queryUserByUsername: async username => await db.q('select * from users where username = ? ', [username]),
    queryUserByUserEmail: async useremail => await db.q('select * from users where email = ? ', [useremail]),
    queryUserByUserPhone: async userphone => await db.q('select * from users where phone = ? ', [userphone]),
    queryUserDataByUsername: async username => await db.q('select 1 from users where username = ?', [username])
}