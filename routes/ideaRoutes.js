import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const ideas = [
    { id: 1, title: 'Idea1', description: 'This is idea one' },
    { id: 2, title: 'Idea2', description: 'This is idea two' },
    { id: 2, title: 'Idea3', description: 'This is idea three' },
  ];
  res.json(ideas);
});

router.post('/', (req, res) => {
  const { title, description } = req.body;
  console.log(title);
  res.send(description);
});

export default router;
