const User = require('../../models/user');
const Activity = require('../../models/activity');
const path = require('path');
const fs = require('fs');

exports.getProviderProfile = async (req, res) => {
    try {
      const provider = await User.findById(req.user.id).select('-password');
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
  
      res.json(provider);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.createActivity = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const {
      title,
      category,
      location,
      targetAudience,
      participantsMin,
      participantsMax,
      activityDuration,
      activityDurationUnit,
      activityPricing,
      activityPricingBase,
      description,
      videoLink,
    } = req.body;

    // Optional availableDates
    const availableDates = Array.isArray(req.body.availableDates)
      ? req.body.availableDates.map(date => new Date(date))
      : [];

    const newActivity = new Activity({
      organizer: organizer._id,
      title,
      category,
      location,
      targetAudience,
      participantsMin,
      participantsMax,
      activityDuration,
      activityDurationUnit,
      activityPricing,
      activityPricingBase,
      coverImage: req.file?.filename || '', // multer handles file
      videoLink: videoLink || null,
      description,
      availableDates,
    });

    const savedActivity = await newActivity.save();

    res.status(201).json(savedActivity);
  } catch (err) {
    console.error('Activity creation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};