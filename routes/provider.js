const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getProviderProfile, createActivity} = require('../controllers/providerControllers/providerController')
const upload=require('../middleware/fileUploader')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('provider'),getProviderProfile);
router.post('/activities',protect, authorizeRoles('provider'),upload.single('coverImage'),createActivity)
module.exports = router;