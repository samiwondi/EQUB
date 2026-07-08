const { User } = require('../models');
const { generateToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { fayda_id, full_name, email, password, phone, role } = req.body;

    if (!fayda_id) {
      return res.status(400).json({ message: 'Fayda ID is required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingFayda = await User.findOne({ where: { fayda_id } });
    if (existingFayda) {
      return res.status(400).json({ message: 'Fayda ID already registered' });
    }

    const user = await User.create({
      fayda_id,
      full_name,
      email,
      password_hash: password,
      phone,
      role: role || 'member',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await user.update({ last_login: new Date() });

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };