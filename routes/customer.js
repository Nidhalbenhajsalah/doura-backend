const express = require('express');
const {getAllActivities,getActivityById}= require('../controllers/customerControllers/customerController')
const router = express.Router();

router.get('/activities',getAllActivities)
router.get('/activity/:id',getActivityById)
module.exports = router;