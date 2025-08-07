const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {processImages}=require('../middleware/processImages');
const {getProviderProfile, createActivity, getAllActivities, getActivityById, editActivity, editProfileInfos} = require('../controllers/providerControllers/providerController')
const upload=require('../middleware/fileUploader')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('provider'),getProviderProfile);
router.post('/activities',protect, authorizeRoles('provider'),upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'additionalImages', maxCount: 5 }]),processImages,createActivity)
router.get('/activities', protect, authorizeRoles('provider'), getAllActivities)
router.get('/activity/:id',protect, authorizeRoles('provider'),getActivityById)
router.put('/activity/:id', protect, authorizeRoles('provider'), upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'additionalImages', maxCount: 5 }]),processImages, editActivity)
// for provider and admin roles
router.patch('/profile-infos/:providerId',protect,authorizeRoles('provider','admin'),editProfileInfos)
module.exports = router;