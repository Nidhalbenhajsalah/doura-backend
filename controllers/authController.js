const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agency = require('../models/agency');
const User = require('../models/user');
const {generateToken,generateRefreshToken} = require('../utils/generateToken');

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

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set to false in dev if needed
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }).json({accessToken});

    // res.json({ token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401); // Unauthorized

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden (token invalid or expired)

    const newAccessToken = generateAccessToken({ _id: user.id, role: user.role });
    res.json({ accessToken: newAccessToken });
  });
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });
  res.sendStatus(204); // No content
};


