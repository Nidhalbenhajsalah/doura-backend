const express = require('express');
const { agencyRegister, agencyLogin,register,login,refreshToken,logout  } = require('../controllers/authController');

const router = express.Router();

// router.post('/register', agencyRegister);
// router.post('/login', agencyLogin);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
module.exports = router;
