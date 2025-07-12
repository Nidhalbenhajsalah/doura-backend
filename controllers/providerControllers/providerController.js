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

exports.editProfileInfos = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const updates = req.body;

        // 1. Validate provider exists
        const existingProvider = await User.findById(providerId);
        if (!existingProvider) {
            return res.status(404).json({ 
                success: false,
                message: 'Provider not found' 
            });
        }

        // 2. Define allowed updatable fields
        const allowedUpdates = ['name','mobile','location', 'instagram', 'facebook', 'tiktok', 'whatsapp'];
        const isValidOperation = Object.keys(updates).every(update => 
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Invalid updates! Only name and social media fields can be updated'
            });
        }

        // 3. Apply updates
        Object.keys(updates).forEach(update => {
            existingProvider[update] = updates[update];
        });

        // 4. Save with validation
        const updatedProvider = await existingProvider.save();

        res.status(200).json({
            success: true,
            message: 'profile.profile_infos_update_success'
        });

    } catch (err) {  
      // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                errors 
            });
        }
        
        // Handle duplicate key errors (e.g., if you had unique fields)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered',
                error: err.message
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            success: false,
            message: 'profile.internal server error',
            error: err.message 
        });
    
    }
};
