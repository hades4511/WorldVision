const getdb = require('../util/database').getdb;

module.exports = class Author{
    constructor(username, fullname, email, password){
        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
    }

    signup() {
        const db = getdb();
        return db.collection('authors').insertOne(this);
    }

    update(){
        const db = getdb();
        return db.collection('authors').updateOne({username: this.username}, { $set: this });
    }

    static signin(username, password){
        const db = getdb();
        return db.collection('authors').find({username: username, password: password}).next();
    }

    static findById(username){
        const db = getdb();
        return db.collection('authors').find({username: username}).next();
    }

    static updatenameinarticle(username, fullname){
        const db = getdb();
        return db.collection('articles').updateMany({ authorname: username }, { $set: {authorfname: fullname} });
    }
};