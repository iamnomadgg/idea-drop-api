import { jwtVerify } from 'jose';
import User from '../models/User.js';
import { CustomError } from '../middleware/errorHandler.js';
import { JWT_SECRET } from '../utils/getJwtSecret.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new CustomError('Not Authorized, no token', 401);

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId).select('_id name email');
    if (!user) throw new CustomError('User not found', 401);

    req.user = user;
    next();
  } catch (err) {
    throw new CustomError('Not authorized, token failed', 401);
  }
};
