import express from 'express';
const router = express.Router();

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
router.get('/', (req, res) => {
  const ideas = [
    { id: 1, title: 'Idea1', description: 'This is idea one' },
    { id: 2, title: 'Idea2', description: 'This is idea two' },
    { id: 2, title: 'Idea3', description: 'This is idea three' },
  ];
  res.status(400);
  throw new Error('This is an error');
  res.json(ideas);
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
