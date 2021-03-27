const Article = require("../models/article");
const throwerror = require('../authentication/error');

exports.loadArticle = (req, res, next) => {
    let sarticle, dates;
    Article.fetchById(req.query.id)
    .then(article => {
        sarticle = article;
        return Article.sortbydate(-1, 10);
    })
    .then(result => {
        dates = result.filter(function( obj ) {
                    return obj._id.toString() !== sarticle._id.toString();
                }).slice(0, 9);
        return Article.searchforcategory("politics", true);
    })
    .then(result => {
        let politics = dates.concat(sarticle);
        politics = result.filter(({ _id: id1 }) => !politics.some(({ _id: id2 }) => id2.toString() === id1.toString()))
                            .slice(0, 4);
        sarticle.clicks += 1;
        Article.updateclick(sarticle._id, sarticle.clicks);
        res.render('article',{
            article: sarticle,
            top: dates.slice(0, 4),
            popular: dates.slice(4, 8).sort((a, b) => (a.clicks > b.clicks) ? 1 : ((b.clicks > a.clicks) ? -1 : 0)),
            single: dates[8],
            politics: politics
        });
    })
    .catch(err => throwerror(err, 500));
}

exports.homePage = (req, res, next) => {
    let dates, clicks, politics;
    Article.sortbydate(-1, 17)
    .then(result => {
        dates = result;
        return Article.sortbyclicks(-1);
    })
    .then(result => {
        clicks = result.filter(({ _id: id1 }) => !dates.some(({ _id: id2 }) => id2.toString() === id1.toString()))
                .slice(0, 5);
        return Article.searchforcategory("politics", true);
    })
    .then(result => {
        politics = dates.concat(clicks);
        politics = result.filter(({ _id: id1 }) => !politics.some(({ _id: id2 }) => id2.toString() === id1.toString()))
                    .slice(0, 4);
        return Article.searchforcategory("world", true);
    })
    .then(result => {
        let world = dates.concat(clicks);
        world = result.filter(({ _id: id1 }) => !world.some(({ _id: id2 }) => id2.toString() === id1.toString()))
                .slice(0, 5);
        res.render('home',{
            top: dates.slice(0, 4).sort((a, b) => (a.clicks > b.clicks) ? 1 : ((b.clicks > a.clicks) ? -1 : 0)),
            carousel: dates[4],
            side: dates.slice(5, 11),
            politics: politics,
            world: world,
            latest: dates.slice(11),
            popular: clicks
        });
    })
    .catch(err => throwerror(err, 500));
}

exports.Category = (req, res, next) => {
    const category = req.query.cat;
    const articlecount = 21;
    let resultarray; 
    Article.searchforcategory(category, true)
    .then(result => {
        resultarray = result;
        return Article.searchforcategory(category, false);
    })
    .then(result => {
        if(resultarray.length != 0){
            res.render('category', {
                category: category.toUpperCase(),
                main: resultarray[0],
                firstrow: resultarray.slice(1, 5),
                rest: resultarray.slice(5, articlecount),
                other: result.slice(0, 8)
            });
        }
        else{
            res.render('category', {
                category: category.toUpperCase(),
                main: result[0],
                firstrow: result.slice(1, 5),
                rest: result.slice(5, articlecount),
                other: result.slice(articlecount, articlecount + 8)
            });
        }
    })
    .catch(err => throwerror(err, 500));
}