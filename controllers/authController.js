const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agency = require('../models/agency');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

exports.agencyRegister = async (req, res) => {
  const { name,email, password } = req.body;
  try {
    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) return res.status(400).json({ message: 'Agency already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agency = new Agency({name, email, password: hashedPassword });
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

    const token = jwt.sign({ id: agency._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['traveler', 'provider', 'guide'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


