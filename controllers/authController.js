const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const {generateAccessToken,generateRefreshToken} = require('../utils/generateAccessToken');
const sendEmail = require('../utils/sendEmail');


exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['traveler', 'provider', 'guide','admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
        // Set status based on role
    const status = (role === 'provider' || role === 'guide') ? 'pending' : 'approved';

    const user = new User({ name, email, password: hashedPassword, role,status });
    await user.save();
    if (status === 'pending') {
      return res.status(201).json({ 
        message: 'Registration submitted for admin approval',
        status: 'pending'
      });
    }
    res.status(201).json({ token: generateAccessToken(user) ,status:'approved'});
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
    
    // Check if account is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval',
        status: user.status
      });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set to false in dev if needed
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }).json({accessToken});

    // res.json({ token: generateAccessToken(user) });
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:4200/reset-password/${token}`;
    const message = `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;

    await sendEmail(user.email, 'Reset Your Password', message);

    res.json({ message: 'Reset password email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


