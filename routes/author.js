const express = require('express');
const csrf = require('csurf');
const { body } = require('express-validator');

const isAuth = require('../authentication/isAuth');
const authorController = require('../controllers/author');

const router = express.Router();
const csrfProtection = csrf();

router.use(csrfProtection);

router.get('/editarticle', isAuth, authorController.EditArticle);
// router.get('/deletearticle', isAuth, authorController.DeleteArticle);
router.delete('/deletearticle', isAuth, authorController.DeleteArticle)
router.post(
    '/profile',
    isAuth,
    [
        body('name', 'Please enter a name containing only alphabets and spaces')
            .notEmpty()
            .custom((value) => {
                return value.match(/^[A-Za-z ]+$/);
            })
            .trim(),
        body('email', 'Please enter a valid email address')
            .notEmpty()
            .isEmail()
            .normalizeEmail(),
        body('oldpass', 'Please enter correct old password')
            .notEmpty()
            .trim(),
        body('newpass', 'Please enter a password with atleast 8 characters containing at least one uppercase letter, one lowercase letter, and one number')
        .notEmpty()
        .trim()
        .isStrongPassword(
          {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0
          }
        ),
        body('re_pass')
            .custom( (value, {req} ) => {
                if(value.trim() !== req.body.newpass){
                    throw new Error('New password and confirm password do not match');
                }
                return true;
            })
    ],
    authorController.UpdateProfile
);
router.post(
    '/newpost',
    isAuth,
    [
        body('name', 'Please enter a name for article')
            .notEmpty()
            .trim(),
        body('heading', 'Please enter a heading for article')
            .notEmpty()
            .trim(),
        body('url', 'Please enter a valid url for article image')
            .notEmpty()
            .isURL()
            .trim(),
        body('post', 'Please write content for article')
            .notEmpty()
            .trim()
    ],
    authorController.NewDecider
);
router.post(
    '/editarticle',
    isAuth,
    [
        body('name', 'Please enter a name for article')
            .notEmpty()
            .trim(),
        body('heading', 'Please enter a heading for article')
            .notEmpty()
            .trim(),
        body('url', 'Please enter a valid url for article image')
            .notEmpty()
            .isURL()
            .trim(),
        body('post', 'Please write content for article')
            .notEmpty()
            .trim()
    ],
    authorController.EditDecider
);
router.use('/profile', isAuth, authorController.Profile);
router.use('/newpost', isAuth, authorController.New);
router.use('/dashboard', isAuth, authorController.Dashboard);
router.use('/articles', isAuth, authorController.Articles);

module.exports = router;