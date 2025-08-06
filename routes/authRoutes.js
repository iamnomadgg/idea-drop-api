import express from 'express';
import User from '../models/User.js';
import { CustomError } from '../middleware/errorHandler.js';

const router = express.Router();

// @route       POST api/auth/register
// @description Register new user
// @access      Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim()) throw new CustomError('name is required', 400);
  if (!email?.trim()) throw new CustomError('email is required', 400);
  if (!password) throw new CustomError('password is required', 400);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new CustomError('User already exists', 400);

  const user = await User.create({ name, email, password });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});
export default router;
