import { prisma } from '../lib/db.js';

// Retrieves descending list of video-specific comments
export const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const comments = await prisma.comment.findMany({
      where: { videoId: videoId },
      include: { user: true }, // Appends relational user data for rendering
      orderBy: { createdAt: 'desc' } // Enforces newest-first ordering
    });
    
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch comments" });
  }
};

// Persists new comment mapping to video and user
export const addComment = async (req, res) => {
  try {
    const { text, videoId, userId } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        text,
        videoId,
        userId
      }
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not add comment" });
  }
};