exports.footerAbout = (req, res, next) => {
    res.render('about');
}

exports.footerContact = (req, res, next) => {
    res.render('contact');
}

exports.footerContactSubmit = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    res.render('contact');
}