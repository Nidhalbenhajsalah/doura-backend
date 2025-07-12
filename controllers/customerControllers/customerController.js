const Activity = require('../../models/activity');
const User= require('../../models/user');
// get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 2; // Default limit
    const currentPage = !Number.isNaN(page) && page > 0 ? page : 1;
    const perPage = !Number.isNaN(limit) && limit > 0 ? limit : 2;
    const skip = (currentPage - 1) * perPage;
const { category, audience,date } = req.query;
    const filter = {status: true};
    if (category) {
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
    
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .skip(skip)
        .limit(perPage)
        // .populate('organizer', 'name email')
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

// get organizer contact
exports.getOrganizerContact = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ 
      contact: {
      instagram:provider.instagram,
      facebook:provider.facebook,
      whatsapp:provider.whatsapp,
      email:provider.email,
      phone:provider.phone

    } });
  } catch (err) {
    console.error('Error fetching organizer contact:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};