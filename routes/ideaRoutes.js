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

  const idea = await Idea.findById(id);

  if (!idea) throw new CustomError('Idea Not Found', 404);

  res.json(idea);
});

// @route           POST /api/ideas
// @description     Create a new idea
// @access          Public
router.post('/', async (req, res) => {
  const { title, summary, description, tags } = req.body;
  if (!title?.trim()) throw new CustomError('title is required', 400);
  if (!summary?.trim()) throw new CustomError('summary is required', 400);
  if (!description?.trim())
    throw new CustomError('description is required', 400);

  const newIdea = new Idea({
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
// @access          Public
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const idea = await Idea.findByIdAndDelete(id);

  if (!idea) throw new CustomError('Idea Not Found', 404);

  res.json({ message: 'Idea deleted successfully' });
});

// @route           PUT /api/ideas/:id
// @description     Edit single idea
// @access          Public
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CustomError('Idea Not Found', 404);

  const { title, summary, description, tags } = req.body;
  if (!title?.trim()) throw new CustomError('title is required', 400);
  if (!summary?.trim()) throw new CustomError('summary is required', 400);
  if (!description?.trim())
    throw new CustomError('description is required', 400);

  const updatedIdea = await Idea.findByIdAndUpdate(
    id,
    {
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
    },
    { new: true, runValidators: true }
  );

  if (!updatedIdea) throw new CustomError('Idea Not Found', 404);

  res.json(updatedIdea);
});

export default router;
