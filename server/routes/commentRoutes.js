import express from 'express';
import { getComments, addComment } from '../controllers/commentController.js';

const router = express.Router();

// Retrieves contextual array
router.get('/:videoId', getComments);

// Persists mapped resource
router.post('/', addComment);

export default router;