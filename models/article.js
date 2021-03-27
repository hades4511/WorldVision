const getdb = require('../util/database').getdb;
const mongodb = require('mongodb');

module.exports = class Article{
    constructor(authorname, authorfname, type, date, name, heading, content, imageurl, clicks, id){
        this._id = id;
        this.authorfname = authorfname;
        this.authorname = authorname;
        this.type = type;
        this.date = date;
        clicks ? this.clicks = clicks : this.clicks = 0;
        this.name = name;
        this.heading = heading;
        this.imageurl = imageurl;
        this.content = content;
    }

    setid(id){
        this._id = new mongodb.ObjectId(id);
    }

    save(){
        const db = getdb();
        return db.collection('articles').insertOne(this);
        // .then(result =>{
            
        // })
        // .catch(err => {
        //     console.log(err);
        // });
    }

    update(){
        const db = getdb();
        return db.collection('articles').updateOne({ _id: this._id }, { $set: this });
    }

    static fetchAllByAuthorId(authorname){
        const db = getdb();
        return db.collection('articles').find({ authorname: authorname }).toArray();
    }

    static fetchById(articleid){
        const db = getdb();
        return db.collection('articles').find({ _id: new mongodb.ObjectId(articleid) }).next();
    }

    static updateclick(articleid, clicks){
        const db = getdb();
        return db.collection('articles').updateOne({ _id: new mongodb.ObjectId(articleid) }, { $set: { clicks: clicks } });
        // .then(result => {

        // })
        // .catch(err => console.log(err));
    }

    static deletebyid(articleid){
        const db = getdb();
        return db.collection('articles').deleteOne({ _id: new mongodb.ObjectId(articleid) });
    }

    static sortbydate(order, limit){
        const db = getdb();
        return db.collection('articles').find().sort({ "date": order }).limit( limit ).toArray();
    }

    static sortbyclicks(order){
        const db = getdb();
        return db.collection('articles').find().sort({ "clicks": order }).toArray();
    }

    static searchforcategory(type, mode){
        const db = getdb();
        if(mode)
            return db.collection('articles').find({ type: type }).sort({"date": -1, "clicks": -1}).toArray()
        return db.collection('articles').find({type: {$ne: type}}).sort({"date": -1, "clicks": -1}).toArray()    
    }

    static searchfordashboard(authorid){
        const db = getdb();
        return db.collection('articles').find({ authorname: authorid }).sort({ "date" : -1 }).toArray();
    }
};