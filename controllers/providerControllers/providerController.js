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

// get all activities
exports.getAllActivities = async (req, res) => {
  try {
    // Find activities where the 'organizer' field matches the current user's ID
    const activities = await Activity.find({ organizer: req.user.id });

    res.status(200).json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get activity by id
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// edit activity
exports.editActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const updatedActivityData = req.body;

    // Check if the activity exists
    const existingActivity = await Activity.findById(activityId);
    if (!existingActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Optional: check if current user is the organizer
    if (existingActivity.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Parse availableDates
    let availableDates = [];
    if (Array.isArray(updatedActivityData.availableDates)) {
      availableDates = updatedActivityData.availableDates.map(date => new Date(date));
    }

    // Handle coverImage if a new file is uploaded
    if (req.file) {
      // Optional: delete old image file
      if (existingActivity.coverImage) {
        const oldImagePath = path.join(__dirname, '../../uploads/activities', existingActivity.coverImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old cover image:', err);
        });
      }

      updatedActivityData.coverImage = req.file.filename;
    }

    // Set updated fields
    const updatedActivity = await Activity.findByIdAndUpdate(
      activityId,
      {
        ...updatedActivityData,
        availableDates, // ensure dates are converted
      },
      { new: true }
    );

    res.status(200).json(updatedActivity);
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
