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

exports.getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 2; // Default limit
    const currentPage = !Number.isNaN(page) && page > 0 ? page : 1;
    const perPage = !Number.isNaN(limit) && limit > 0 ? limit : 2;
    const skip = (currentPage - 1) * perPage;
const { category, audience,date,activityPriceSort } = req.query;
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category; // assuming category is stored as a string like 'sports', 'art', etc.
    }
    if(audience){
      filter.targetAudience=audience
    }

        if (date) {
      // Convert the query date string to a Date object
      const selectedDate = new Date(date);
      
      // Filter activities where availableDates includes the selected date
      // We need to compare dates without time components
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.availableDates = {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      };
    }

    let sortOption = {};
    if (activityPriceSort === 'desc') {
      sortOption.activityPricing = -1;
    }
    else if (activityPriceSort === 'asc') {
      sortOption.activityPricing = 1; // For example, ascending order
    }
     else {
      // Default sort (optional)
      sortOption.createdAt = -1; // For example, newest first
    }
    
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .skip(skip)
        .limit(perPage)
        // .populate('organizer', 'name email')
        .sort(sortOption), // optional: latest first
      Activity.countDocuments(filter)
    ]);

    res.status(200).json({
      data: activities,
      total,
       page: currentPage,
       totalPages: Math.ceil(total / perPage),
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllActivityProviders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // optional: pending, approved, suspended
    const skip = (page - 1) * limit;

    // Build dynamic query
    const query = { role: 'provider' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const [providers, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      data: providers,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error('Error fetching providers:', err);
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
    const activity = await Activity.findById(req.params.id).populate({
      path: 'organizer',
      select: 'email instagram facebook whatsapp tiktok'
    });
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

    // if (user.status !== 'pending') {
    //   return res.status(400).json({ message: 'User is not pending approval' });
    // }

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

    // if (user.status !== 'pending') {
    //   return res.status(400).json({ message: 'User is not pending approval' });
    // }

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


exports.getProviderProfile = async (req, res) => {
    try {
      const providerId = req.params.providerId;
      const provider = await User.findById(providerId).select('-password');
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
  
      res.json(provider);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.getProviderActivities=async(req,res)=>{
    try {
      const providerId = req.params.providerId;
      const activities = await Activity.find({ organizer: providerId })
      .sort({ createdAt: -1 }); // Optional: sort by most recent

    if (!activities || activities.length === 0) {
      return res.status(404).json({ message: 'No activities found for this provider.' });
    }

    return res.status(200).json(activities);
    } catch (error) {
    console.error('Error fetching provider activities:', error);
    return res.status(500).json({ message: 'Server error while fetching activities.' });
    }
  }