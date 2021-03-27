const express = require('express');
const homeController = require('../controllers/home');
const router = express.Router();

router.get('/article', homeController.loadArticle);
router.get('/category', homeController.Category);
router.get('/', homeController.homePage);

module.exports = router;