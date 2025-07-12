const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getProviderProfile, createActivity, getAllActivities, getActivityById, editActivity, editProfileInfos} = require('../controllers/providerControllers/providerController')
const upload=require('../middleware/fileUploader')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('provider'),getProviderProfile);
router.post('/activities',protect, authorizeRoles('provider'),upload.single('coverImage'),createActivity)
router.get('/activities', protect, authorizeRoles('provider'), getAllActivities)
router.get('/activity/:id',protect, authorizeRoles('provider'),getActivityById)
router.put('/activity/:id', protect, authorizeRoles('provider'), upload.single('coverImage'), editActivity)
// for provider and admin roles
router.patch('/profile-infos/:providerId',protect,authorizeRoles('provider','admin'),editProfileInfos)
module.exports = router;