import express from 'express';
const router = express.Router();
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
import { CustomError } from '../middleware/errorHandler.js';

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
router.get('/', async (req, res) => {
  const ideas = await Idea.find();
  res.json(ideas);
});

// @route           GET /api/ideas/:id
// @description     Get single idea
// @access          Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const idea = await Idea.findById(req.params.id);

  if (!idea) throw new CustomError('Idea Not Found', 404);

  res.json(idea);
});

// @route           POST /api/ideas
// @description     Create a new idea
// @access          Public
router.post('/', (req, res) => {
  const { title, description } = req.body;
  console.log(title);
  res.send(description);
});

export default router;
