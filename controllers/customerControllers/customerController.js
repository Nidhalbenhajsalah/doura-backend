const Activity = require('../../models/activity');

// get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 2; // Default limit
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find()
        .skip(skip)
        .limit(limit)
        .populate('organizer', 'name email')
        .sort({ createdAt: -1 }), // optional: latest first
      Activity.countDocuments()
    ]);

    res.status(200).json({
      data: activities,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};