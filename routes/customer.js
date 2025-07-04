const express = require('express');
const {getAllActivities,getActivityById,getOrganizerContact}= require('../controllers/customerControllers/customerController')
const router = express.Router();

router.get('/activities',getAllActivities)
router.get('/activity/:id',getActivityById)
router.get('/organizer-contact/:id', getOrganizerContact)
module.exports = router;