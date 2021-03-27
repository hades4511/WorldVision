const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const Author = require('../models/author');
const Article = require('../models/article');

const throwerror = require('../authentication/error');

const pro = (res, token, author, err) => {
    res.render('author/profile',{
        dstate: " ",
        tstate: " ",
        author: author,
        csrfToken: token,
        error: err
    });
}

const newp = (res, token, article, err) => {
    res.render('author/newpost',{
        dstate: " ",
        tstate: " ",
        csrfToken: token,
        article: article,
        error: err
    });
}

const editp = (res, token, article, err) => {
    res.render('author/editarticle',{
        dstate: " ",
        tstate: "active",
        article: article,
        csrfToken: token,
        error: err
    });
}

exports.Dashboard = (req, res, next) => {
    Article.searchfordashboard(req.session.username)
    .then(result => {
        if(result.length > 0){
            res.render('author/dashboard',{
                dstate: "active",
                tstate: " ",
                token: req.csrfToken(),
                totalarticles: result.length,
                totalview: result.reduce((n, {clicks}) => n + clicks, 0),
                recentview: result[0].clicks,
                recentname: result[0].name,
                recents: result.slice(0, 4)
            });
        }
        else{
            res.render('author/dashboard',{
                dstate: "active",
                tstate: " ",
                token: req.csrfToken(),
                totalarticles: 0,
                totalview: 0,
                recentview: 0,
                recentname: "",
                recents: result.slice(0, 4)
            });
        }
    })
    .catch(err => throwerror(err, 500) );
}

exports.Articles = (req, res, next) => {
    Article.fetchAllByAuthorId(req.session.username)
    .then(results =>{
        res.render('author/articles',{
            dstate: " ",
            tstate: "active",
            resultbit: results.length > 0 ? true : false,
            results: results,
            token: req.csrfToken()
        }); 
    })
    .catch(err => throwerror(err, 500));
}

exports.Profile = (req, res, next) => {
    Author.findById(req.session.username)
    .then(author => {
        return pro(res, req.csrfToken(), author, '');
    })
    .catch(err => throwerror(err, 500));
}

exports.UpdateProfile = (req, res, next) => {
    const errors = validationResult(req).array();
    if(errors.length > 0){
        console.log(errors);
        return pro(res, req.csrfToken(), {fullname: '', email: ''}, errors[0].msg);
    } 
    const password = req.body.oldpass;
    const username = req.session.username;
    let thisauthor, namecheck = false;
    Author.findById(username)
    .then(author => {
        if(!author){
            req.flash('errp', 'Invalid Username');
            return res.redirect('/author/signin');
        }
        if(req.body.name != author.fullname){
            namecheck = true;
        }
        thisauthor = new Author(username, req.body.name, req.body.email, author.password);
        return bcrypt.compare(password, author.password);
    })
    .then(doMatch => {
        if(doMatch){
            if(req.body.newpass && req.body.conpass && req.body.newpass === req.body.conpass){
                bcrypt.hash(req.body.newpass, 12)
                .then(hashedpass => {
                    thisauthor.password = hashedpass;
                    console.log("password updated");
                })
                .catch(err => throwerror(err, 500));
            }
            else{
                return pro(res, req.csrfToken(), thisauthor, 'New and Old Passwords Do Not Match');
            }
            thisauthor.update()
            .then(result => {
                console.log("profile updated");
                if(namecheck){
                    Author.updatenameinarticle(username, thisauthor.fullname)
                    .then(result => {
                        console.log("names in articles updated");
                    })
                    .catch(err => throwerror(err, 500));
                }
                return pro(res, req.csrfToken(), thisauthor, '');
            })
            .catch(err => throwerror(err, 500));
        }
        else{
            return pro(res, req.csrfToken(), thisauthor, 'Invalid Old Password');
        }
    })
    .catch(err => throwerror(err, 500));
}

exports.New = (req, res, next) => {
    return newp(res, req.csrfToken(), {name: '', heading: '', imageurl: '', content: ''}, '');
}

exports.EditArticle = (req, res, next) => {
    Article.fetchById(req.query.id)
    .then(article => {
        if(article){
            return editp(res, req.csrfToken(), article, '');
        }
        else res.redirect('/author/articles');
    })
    .catch(err => throwerror(err, 500));
}

exports.DeleteArticle = (req, res, next) => {
    const articleid = req.query.id;
    Article.deletebyid(articleid)
    .then(result => {
        if(result){
            console.log("deleted");
            res.status(200).json({msg: 'success'});
        }
    })
    .catch(err => res.status.json({msg: err}));
}

exports.NewDecider = (req, res, next) => {
    const name = req.body.name;
    const heading = req.body.heading;
    const url = req.body.url;
    const p = req.body.post;
    const errors = validationResult(req).array();
    if(errors.length > 0){
        console.log(errors);
        return newp(res, req.csrfToken(), {name: name, heading: heading, imageurl: url, content: p}, errors[0].msg);
    }
    const date = new Date();
    const authorname = req.session.username;
    const type = req.body.type;
    const post = p.split(/\n/);
    for (x in post){
        if( post[x] == "\r")
            post.splice(x, 1);
    }
    const article = new Article(
        authorname, req.session.fullname, type.toLowerCase(), date, name, heading, post, url
    );
    if(req.body.preview){
        res.render('author/preview', {
            article: article
        });
    }
    else{
        article.save()
        .then(result => {
            res.render('author/dashboard',{
                dstate: "active",
                tstate: " "
            });
        })
        .catch(err => throwerror(err, 500));
    }
}

exports.EditDecider = (req, res, next) => {
    const name = req.body.name;
    const heading = req.body.heading;
    const url = req.body.url;
    const p = req.body.post
    const errors = validationResult(req).array();
    if(errors.length > 0){
        console.log(errors);
        return editp(res, req.csrfToken(), {name: name, heading: heading, imageurl: url, content: p}, errors[0].msg);
    }
    const date = new Date();
    const authorname = req.session.username;
    const post = p.split(/\n/);
    for (x in post){
        if( post[x] == "\r")
            post.splice(x, 1);
    }
    const article = new Article(
        authorname, req.session.fullname, type.toLowerCase(), date, name, heading, post, url
    );
    if(req.body.preview){
        res.render('author/preview', {
            article: article
        });
    }
    else{
        article.setid(req.body.update);
        article.update()
        .then(result => {
            res.redirect('/author/articles');
        })
        .catch(err => throwerror(err, 500));
    }
}