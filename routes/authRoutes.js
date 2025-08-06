import express from 'express';
import User from '../models/User.js';
import { CustomError } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/generateToken.js';

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

  //Create Tokens
  const payload = { userId: user._id.toString() };
  const accessToken = await generateToken(payload, '1m');
  const refreshToken = await generateToken(payload, '30d');

  //Set refresh token in HTTP-Only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    //If frontend and backend are stored on the same domain,
    // then "sameSite" can be set as "lax" to make the app a bit more secure.
    //To make frontend and backend stored on the same domain,
    // a proxy can be created on vercel.
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
  });

  res.status(201).json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});
export default router;
