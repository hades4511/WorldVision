const express = require('express');
const footerController = require('../controllers/footer');
const router = express.Router();



router.use('/about', footerController.footerAbout);
router.post('/submitcontact', footerController.footerContactSubmit);
router.use('/contact', footerController.footerContact);

module.exports = router;