const express = require('express');
const homeController = require('../controllers/home');
const router = express.Router();

router.get('/article', homeController.loadArticle);
// router.use('/author', homeController.Magazine);
// router.use('/newspost', homeController.Blog);
router.get('/category', homeController.Category);
router.get('/', homeController.homePage);

module.exports = router;