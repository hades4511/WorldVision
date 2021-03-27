const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const Author = require('../models/author');
const Article = require('../models/article');
const throwerror = require('../authentication/error');

const sin = (res, token, err, user) => {
    res.render('author/auth/signin', {
        csrfToken: token,
        error: err,
        user: user
    });
}

const sup = (res, token, err, user, name, email) => {
    res.render('author/auth/signup', {
        csrfToken: token,
        error: err,
        user: user,
        name: name,
        email: email
    });
}

exports.SignIn = (req, res, next) => {
    sin(res, req.csrfToken(), '', '');
}

exports.SignUp = (req, res, next) => {
    sup(res, req.csrfToken(), '', '', '', '');
}

exports.CreateAccount = (req, res, next) => {
    const errors = validationResult(req).array();
    console.log(errors);
    if(errors.length > 0){
        return sup(res, req.csrfToken(), errors[0].msg, req.body.username, req.body.name, req.body.email);
    }
    const username = req.body.username;
    const fullname = req.body.name;
    const email = req.body.email;
    const password = req.body.pass;
    bcrypt.hash(password, 12)
    .then(hashedpass => {
        const author = new Author(username, fullname, email, hashedpass);
        return author.signup();
    })
    .then(() => {
        sin(res, req.csrfToken(), 'Account Created', '');
    })
    .catch(err => throwerror(err, 500));
}

exports.DashboardPost = (req, res, next) => {
    const errors = validationResult(req).array();
    if(errors.length > 0){
        console.log(errors);
        return sin(res, req.csrfToken(), errors[0].msg, req.body.username);
    }
    const username = req.body.username;
    const password = req.body.password;
    Author.findById(username)
    .then(author => {
        if(!author){
            return sin(res, req.csrfToken(), 'Username not found', username);
        }
        bcrypt.compare(password, author.password)
        .then(doMatch => {
            if(doMatch){
                req.session.username = username;
                req.session.fullname = author.fullname;
                Article.searchfordashboard(username)
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
            else{
                sin(res, req.csrfToken(), 'Invalid Password', username);
            }
        })
    })
    .catch(err => throwerror(err, 500));
}

exports.SignOut = (req, res, next) => {
    req.session.destroy();
    res.redirect('/author/signin');
}