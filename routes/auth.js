const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const { body } = require('express-validator');

const Author = require('../models/author');

const isAuth = require('../authentication/isAuth');
const authController = require('../controllers/auth');

const router = express.Router();

const store = new MongoDBStore({
    uri: `mongodb+srv://${process.env.mongodbName}:${process.env.mongodbPass}@cluster0.7ow4b.mongodb.net/${process.env.mongodbColl}?retryWrites=true&w=majority`,
    collection: 'sessions'
});

const csrfProtection = csrf();

router.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
    })
);

router.use(csrfProtection);

router.post(
  '/signin',
  [
    body('username', 'Please enter a username containing only alphabets and numbers')
      .notEmpty()
      .trim(),
    body('password', 'Please enter a password with atleast 6 characters containing lower case and upper case alphabets and numbers')
      .notEmpty()
      .trim()
  ],
  authController.DashboardPost
);

router.post(
  '/signup',
  [
    body('username', 'Please enter a username containing only alphabets and numbers')
      .notEmpty()
      .isAlphanumeric()
      .trim()
      .custom((value) => {
        return Author.findById(value)
        .then(result => {
          if(result){
            return Promise.reject('Username already exists');
          }
        });
      }),
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
    body('pass', 'Please enter a password with atleast 8 characters containing at least one uppercase letter, one lowercase letter, and one number')
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
        if(value.trim() !== req.body.pass){
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ], 
  authController.CreateAccount
);
router.use('/signup', authController.SignUp);
router.use('/signin', authController.SignIn);
router.use('/signout', isAuth, authController.SignOut);

module.exports = router;