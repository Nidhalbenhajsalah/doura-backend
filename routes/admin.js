const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getAdminProfile, createActivityAsAdmin, getAllActivities, getActivityById, editActivity,getAllActivityProviders} = require('../controllers/adminControllers/adminController')
const upload=require('../middleware/fileUploader')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('admin'),getAdminProfile);
router.get('/providers',protect, authorizeRoles('admin'),getAllActivityProviders)
router.post('/activities',protect, authorizeRoles('admin'),upload.single('coverImage'),createActivityAsAdmin)
router.get('/activities', protect, authorizeRoles('admin'), getAllActivities)
router.get('/activity/:id',protect, authorizeRoles('admin'),getActivityById)
router.put('/activity/:id', protect, authorizeRoles('admin'), upload.single('coverImage'), editActivity)
module.exports = router;