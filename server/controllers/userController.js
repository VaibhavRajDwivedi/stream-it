import { prisma } from '../lib/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { videos: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
