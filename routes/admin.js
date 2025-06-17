const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {getAdminProfile, createActivityAsAdmin, getAllActivities, getActivityById, editActivity,getAllActivityProviders,approveUser,rejectUser,getPendingUsers} = require('../controllers/adminControllers/adminController')
const upload=require('../middleware/fileUploader')
const router = express.Router();

router.get('/profile', protect, authorizeRoles('admin'),getAdminProfile);
router.get('/providers',protect, authorizeRoles('admin'),getAllActivityProviders)
router.post('/activities',protect, authorizeRoles('admin'),upload.single('coverImage'),createActivityAsAdmin)
router.get('/activities', protect, authorizeRoles('admin'), getAllActivities)
router.get('/activity/:id',protect, authorizeRoles('admin'),getActivityById)
router.put('/activity/:id', protect, authorizeRoles('admin'), upload.single('coverImage'), editActivity)
router.get('/pending',protect,authorizeRoles('admin'), getPendingUsers);
router.put('/approve-provider/:id',protect,authorizeRoles('admin'), approveUser);
router.put('/reject-provider/:id',protect,authorizeRoles('admin'), rejectUser);

module.exports = router;