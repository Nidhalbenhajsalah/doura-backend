const express = require('express');
const {getAllActivities}= require('../controllers/customerControllers/customerController')
const router = express.Router();

router.get('/activities',getAllActivities)

module.exports = router;