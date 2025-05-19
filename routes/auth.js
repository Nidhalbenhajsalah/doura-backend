const express = require('express');
const { agencyRegister, agencyLogin,register,login,refreshToken,logout,forgotPassword,resetPassword  } = require('../controllers/authController');

const router = express.Router();

// router.post('/register', agencyRegister);
// router.post('/login', agencyLogin);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
module.exports = router;
