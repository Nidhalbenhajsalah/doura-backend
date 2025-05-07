const express = require('express');
const { agencyRegister, agencyLogin,register,login } = require('../controllers/authController');

const router = express.Router();

// router.post('/register', agencyRegister);
// router.post('/login', agencyLogin);

router.post('/register', register);
router.post('/login', login);

module.exports = router;
