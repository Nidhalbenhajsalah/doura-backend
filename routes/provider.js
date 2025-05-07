const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getProviderProfile} = require('../controllers/providerControllers/providerController')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('provider'),getProviderProfile);
module.exports = router;