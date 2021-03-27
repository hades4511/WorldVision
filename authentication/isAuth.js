module.exports = (req, res, next) =>{
    if(!req.session.username){
        return res.redirect('/author/signin');
    }
    next();
}