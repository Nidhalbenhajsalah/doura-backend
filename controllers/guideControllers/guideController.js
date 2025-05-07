const User = require('../../models/user');

exports.getGuideProfile = async (req, res) => {
    try {
      const guide = await User.findById(req.user.id).select('-password');
      if (!guide) return res.status(404).json({ message: 'Guide not found' });
  
      res.json(guide);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };