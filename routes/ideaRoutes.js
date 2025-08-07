import express from 'express';
const router = express.Router();
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
import { CustomError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/authMiddleware.js';

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
// @query           _limit (optional limit for ideas returned)
router.get('/', async (req, res) => {
  const limit = parseInt(req.query._limit);
  const query = Idea.find().sort({ createdAt: -1 });
  if (!isNaN(limit)) {
    query.limit(limit);
  }
  const ideas = await query.exec();
  res.json(ideas);
});

// @route           GET /api/ideas/:id
// @description     Get single idea
// @access          Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const idea = await Idea.findById(id);

  if (!idea) throw new CustomError('Idea Not Found', 404);

  res.json(idea);
});

// @route           POST /api/ideas
// @description     Create a new idea
// @access          Protected
router.post('/', protect, async (req, res) => {
  const { title, summary, description, tags } = req.body || {};
  if (!title?.trim()) throw new CustomError('title is required', 400);
  if (!summary?.trim()) throw new CustomError('summary is required', 400);
  if (!description?.trim())
    throw new CustomError('description is required', 400);

  const newIdea = new Idea({
    user: req.user._id,
    title,
    summary,
    description,
    tags:
      typeof tags === 'string'
        ? tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : Array.isArray(tags)
        ? tags
        : [],
  });
  const savedIdea = await newIdea.save();
  res.status(201).json(savedIdea);
});

// @route           DELETE /api/ideas/:id
// @description     Delete single idea
// @access          Protected
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const idea = await Idea.findById(id);
  if (!idea) throw new CustomError('Idea not found', 404);

  //Check if user owns idea
  if (idea.user.toString() !== req.user._id.toString())
    throw new CustomError('Not authorized to delete this idea', 403);

  await idea.deleteOne();

  res.json({ message: 'Idea deleted successfully' });
});

// @route           PUT /api/ideas/:id
// @description     Edit single idea
// @access          Protected
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const idea = await Idea.findById(id);
  if (!idea) throw new CustomError('Idea not found', 404);

  //Check if user owns idea
  if (idea.user.toString() !== req.user._id.toString())
    throw new CustomError('Not authorized to update this idea', 403);

  const { title, summary, description, tags } = req.body || {};

  if (!title?.trim()) throw new CustomError('title is required', 400);
  if (!summary?.trim()) throw new CustomError('summary is required', 400);
  if (!description?.trim())
    throw new CustomError('description is required', 400);

  idea.title = title;
  idea.summary = summary;
  idea.description = description;
  idea.tags =
    typeof tags === 'string'
      ? tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : Array.isArray(tags)
      ? tags
      : [];
  const updatedIdea = await idea.save();

  if (!updatedIdea) throw new CustomError('Idea Not Found', 404);

  res.json(updatedIdea);
});

export default router;
