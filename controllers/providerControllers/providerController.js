const User = require('../../models/user');

exports.getProviderProfile = async (req, res) => {
    try {
      const provider = await User.findById(req.user.id).select('-password');
      if (!provider) return res.status(404).json({ message: 'Provider not found' });
  
      res.json(provider);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };