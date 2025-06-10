const User = require('../../models/user');
const Activity = require('../../models/activity');
const path = require('path');
const fs = require('fs');

exports.getAdminProfile = async (req, res) => {
    try {
      const admin = await User.findById(req.user.id).select('-password');
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
  
      res.json(admin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// get all activities
exports.getAllActivities = async (req, res) => {
  try {
    // Fetch all activities in the database
    const activities = await Activity.find().populate('organizer', 'name email');

    res.status(200).json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get all activity organizers
exports.getAllActivityProviders = async (req, res) => {
  try {
    // Fetch all users with the role 'organizer' in the database
    const organizers = await User.find({ role: 'provider' });

    res.status(200).json(organizers);
  } catch (err) {
    console.error('Error fetching organizers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createActivityAsAdmin = async (req, res) => {
  try {
    const {
      organizer, // required
      title,
      status,
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

    if (!organizer) {
      return res.status(400).json({ message: 'Organizer (provider) is required' });
    }

    // Check that the organizer exists and is a provider
    const provider = await User.findById(organizer);
    if (!provider || provider.role !== 'provider') {
      return res.status(400).json({ message: 'Invalid provider ID' });
    }

    // Optional availableDates
    const availableDates = Array.isArray(req.body.availableDates)
      ? req.body.availableDates.map(date => new Date(date))
      : [];

    const newActivity = new Activity({
      organizer: provider._id,
      title,
      status,
      category,
      location,
      targetAudience,
      participantsMin,
      participantsMax,
      activityDuration,
      activityDurationUnit,
      activityPricing,
      activityPricingBase,
      coverImage: req.file?.filename || '',
      videoLink: videoLink || null,
      description,
      availableDates,
    });

    const savedActivity = await newActivity.save();

    res.status(201).json(savedActivity);
  } catch (err) {
    console.error('Admin activity creation error:', err);
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
    // if (existingActivity.organizer.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }

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


exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = 'approved';
    await user.save();

    // Optionally send approval email here

    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = 'suspended';
    await user.save();

    // Optionally send rejection email here

    res.json({ message: 'User rejected', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending', role: { $in: ['provider', 'guide'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};