const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getGuideProfile} = require('../controllers/guideControllers/guideController')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('guide'),getGuideProfile);
module.exports = router;