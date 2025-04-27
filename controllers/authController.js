const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agency = require('../models/agency');

exports.agencyRegister = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) return res.status(400).json({ message: 'Agency already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agency = new Agency({ email, password: hashedPassword });
    await agency.save();

    res.status(201).json({ message: 'Agency registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.agencyLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const agency = await Agency.findOne({ email });
    if (!agency) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, agency.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
