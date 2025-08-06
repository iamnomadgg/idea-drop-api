import express from 'express';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '../utils/getJwtSecret.js';
import User from '../models/User.js';
import { CustomError } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// @route       POST api/auth/register
// @description Register new user
// @access      Public
router.post('/register', async (req, res) => {
  if (!req.body?.name?.trim()) throw new CustomError('name is required', 400);
  if (!req.body?.email?.trim()) throw new CustomError('email is required', 400);
  if (!req.body?.password) throw new CustomError('password is required', 400);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new CustomError('User already exists', 400);

  const user = await User.create({ name, email, password });

  //Create tokens
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

// @route       POST api/auth/login
// @description Authenticate user
// @access      Public
router.post('/login', async (req, res) => {
  if (!req.body?.email?.trim()) throw new CustomError('email is required', 400);
  if (!req.body?.password) throw new CustomError('password is required', 400);

  //Find user
  const user = await User.findOne({ email });
  if (!user) throw new CustomError('Invalid Credentials', 401);

  //Check if the password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new CustomError('Invalid Credentials', 401);

  //Create tokens
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

// @route       POST api/auth/logout
// @description Logout user and clear refresh token
// @access      Private
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// @route       POST api/auth/refresh
// @description Generate new access token from refresh token
// @access      Public (Needs valid refresh token in cookie)
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new CustomError('No refresh token', 401);

  const { payload } = await jwtVerify(token, JWT_SECRET);

  const user = await User.findById(payload.userId);
  if (!user) throw new CustomError('No user', 401);

  const newAccessToken = await generateToken(
    { userId: user._id.toString() },
    '1m'
  );
  res.json({
    accessToken: newAccessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export default router;
