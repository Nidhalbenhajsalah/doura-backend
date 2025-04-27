const express = require('express');
const { agencyRegister, agencyLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/register', agencyRegister);
router.post('/login', agencyLogin);

module.exports = router;
