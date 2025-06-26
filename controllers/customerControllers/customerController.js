const Activity = require('../../models/activity');

// get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 2; // Default limit
    const currentPage = !Number.isNaN(page) && page > 0 ? page : 1;
    const perPage = !Number.isNaN(limit) && limit > 0 ? limit : 2;
    const skip = (currentPage - 1) * perPage;
const { category, audience } = req.query;
    const filter = {};
    if (category) {
      filter.category = category; // assuming category is stored as a string like 'sports', 'art', etc.
    }
    if(audience){
      filter.targetAudience=audience
    }
    
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .skip(skip)
        .limit(perPage)
        .populate('organizer', 'name email')
        .sort({ activityPricing: 1 }), // optional: latest first
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