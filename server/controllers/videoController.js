import { prisma } from '../lib/db.js';
import { generateEmbedding } from '../lib/generateEmbedding.js';

// Returns raw descending feed payload
export const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      include: { 
        user: true, // Includes creator relation
        comments: true 
      }, 
      orderBy: { id: 'desc' } // Default sorting by newest
    });
    res.json(videos);
  } catch (error) {
    console.log("DATABASE ERROR:", error);
    res.status(500).json({ error: "Could not fetch videos" });
  }
};

// Handles new video creation and vector embedding injection
export const createVideo = async (req, res) => {
  try {
    // Payload requires explicit userId for relation binding
    const { title,description ,videoUrl, thumbnailUrl, userId } = req.body;

    const newVideo = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        userId, // F-Key relation to User
      },
    });

    // Queue embedding generation based on payload text
    const textToEmbed = `${title}. ${description || ''}`;
    const embeddingArray = await generateEmbedding(textToEmbed);

    // Commits calculated vector to row using pgvector standard syntax
    if (embeddingArray) {
      const formattedVector = `[${embeddingArray.join(',')}]`;
      
      await prisma.$executeRaw`
        UPDATE "Video" 
        SET embedding = ${formattedVector}::vector 
        WHERE id = ${newVideo.id}
      `;
    }

    res.json(newVideo);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong. Check if User ID is valid." });
  }
};


export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params; // Extracts entity constraint

    const video = await prisma.video.findUnique({
      where: { id: id },
      include: { user: true } // Fetches uploader string
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    console.log("VIDEO FETCH ERROR:", error);
    res.status(500).json({ error: "Error fetching video" });
  }
};



// Queries scoped exclusively by userId index
export const getVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const videos = await prisma.video.findMany({
      where: { userId: userId },
      orderBy: { id: 'desc' }
    });
    res.json(videos);
  } catch (error) {
    console.error("FETCH USER VIDEOS ERROR:", error);
    res.status(500).json({ error: "Could not fetch your videos" });
  }
};

// Purges video record and related dependents
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Drops child comments sequentially avoiding constraint violations
    await prisma.comment.deleteMany({
      where: { videoId: id }
    });

    // Purges target node
    await prisma.video.delete({
      where: { id: id }
    });

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("DELETE VIDEO ERROR:", error);
    res.status(500).json({ error: "Could not delete video" });
  }
};


// ILIKE string matching equivalent on text properties
export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query; // Extracts parameter

    if (!q) {
      return res.json([]); // Fail-safe empty return
    }

    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: { 
        user: true // Exposes entity descriptor
      },
      orderBy: { id: 'desc' }
    });

    res.json(videos);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ error: "Could not search videos" });
  }
};




// pgvector computational endpoint extracting cosine limits
export const getRecommendations = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    // Raw SQL resolves cosine distance (<=>) matching between vector dimensions
    const recommendations = await prisma.$queryRaw`
      SELECT 
        v.id, 
        v.title, 
        v.description, 
        v."thumbnailUrl", 
        v."videoUrl", 
        v."userId",
        json_build_object('id', u.id, 'name', u.name) as user
      FROM "Video" v
      JOIN "User" u ON v."userId" = u.id
      WHERE v.id != ${videoId} 
        AND v.embedding IS NOT NULL
      ORDER BY v.embedding <=> (SELECT embedding FROM "Video" WHERE id = ${videoId})
      LIMIT 5;
    `;

    res.json(recommendations);
  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    res.status(500).json({ error: "Could not fetch recommendations" });
  }
};


// Tracks atomic viewer history log
export const logWatchHistory = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user.id; // Enforced by protectRoute middleware

    // Checks composite uniqueness constraints
    const existingHistory = await prisma.watchHistory.findFirst({
      where: {
        userId: userId,
        videoId: videoId,
      },
    });

    if (existingHistory) {
      // Upserts timestamp preserving duplicate insertions
      await prisma.watchHistory.update({
        where: { id: existingHistory.id },
        data: { createdAt: new Date() },
      });
    } else {
      // Establishes new node relation
      await prisma.watchHistory.create({
        data: {
          userId: userId,
          videoId: videoId,
        },
      });
    }

    return res.status(200).json({ success: true, message: "Watch history updated" });
  } catch (error) {
    console.error("Error updating watch history:", error);
    return res.status(500).json({ error: "Failed to update watch history" });
  }
};



// Retrieves chronological watch instances
export const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sorts logs injecting relational object scopes
    const history = await prisma.watchHistory.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        video: {
          include: {
            user: true // Mounts uploader data object
          }
        }
      }
    });

    // Flattens schema tree array mapping fields
    const formattedHistory = history.map((item) => ({
      ...item.video,
      viewedAt: item.createdAt, 
    }));

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return res.status(500).json({ error: "Failed to fetch watch history" });
  }
};


export const removeFromHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    // Forces aggregate flush over possible composite duplicates
    await prisma.watchHistory.deleteMany({
      where: {
        userId: userId,
        videoId: videoId,
      },
    });

    return res.status(200).json({ success: true, message: "Removed from history" });
  } catch (error) {
    console.error("Error removing from history:", error);
    return res.status(500).json({ error: "Failed to remove from history" });
  }
};







// Advanced multi-seed relational aggregate payload generator
export const getHomeFeed = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Tunable constant parameters
    const numHistoryVideos = 5; 
    const numRecsPerVideo = 5;  
    // ------------------------------

    if (userId) {
      // Extracts logical node constraints
      const recentHistory = await prisma.watchHistory.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: numHistoryVideos,
        select: { videoId: true } // Fetches target id strictly
      });

      if (recentHistory.length > 0) {
        // Maintains distinct occurrences mapped against priority sorting keys
        const candidateMap = new Map();

        // Concurrently spawns queries minimizing aggregate latency
        await Promise.all(recentHistory.map(async (historyItem, index) => {
          
          // Weights priority dynamically based on positional recency index
          const currentPriority = recentHistory.length - index;

          // Instructs pgvector filtering closest logical dimensions
          const similarVideos = await prisma.$queryRaw`
            SELECT 
              v.id, v.title, v.description, v."videoUrl", v."thumbnailUrl", v."userId", 
              u.name as "userName"
            FROM "Video" v
            JOIN "User" u ON v."userId" = u.id
            WHERE v.id NOT IN (
              SELECT "videoId" FROM "WatchHistory" WHERE "userId" = ${userId}
            )
            AND v.embedding IS NOT NULL
            ORDER BY v.embedding <-> (
              SELECT embedding FROM "Video" WHERE id = ${historyItem.videoId} LIMIT 1
            )::vector
            LIMIT ${numRecsPerVideo};
          `;

          // 3. Deduplication constraint resolution
          for (const video of similarVideos) {
            if (!candidateMap.has(video.id)) {
              // Maps initial occurrence value
              candidateMap.set(video.id, { ...video, priority: currentPriority });
            } else {
              // Evaluates overlap precedence replacing lower priority keys
              const existingVideo = candidateMap.get(video.id);
              if (currentPriority > existingVideo.priority) {
                candidateMap.set(video.id, { ...video, priority: currentPriority });
              }
            }
          }
        }));

        // Mutates collection mapping values
        let finalRecommendations = Array.from(candidateMap.values());
        
        // Ascending value sorting
        finalRecommendations.sort((a, b) => b.priority - a.priority);

        if (finalRecommendations.length > 0) {
          return res.status(200).json(finalRecommendations);
        }
      }
    }

    // Default return logic when context evaluation fails
    const fallbackFeed = await prisma.video.findMany({
      take: 15,
      orderBy: { id: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const formattedFallback = fallbackFeed.map(v => ({
      ...v, userName: v.user.name
    }));

    return res.status(200).json(formattedFallback);

  } catch (error) {
    console.error("Error fetching home feed:", error);
    return res.status(500).json({ error: "Failed to fetch home feed" });
  }
};



export const addView = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    // Resolves concurrency edge-cases naturally through DB atomic scaling logic
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        views: { increment: 1 }
      }
    });

    return res.status(200).json({ success: true, views: updatedVideo.views });
  } catch (error) {
    console.error("Error adding view:", error);
    return res.status(500).json({ error: "Failed to add view" });
  }
};


// Evaluates current unique state mappings
export const getVideoReactions = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user?.id; // From optionalAuth middleware

    // Validates target relational stats
    const likes = await prisma.reaction.count({ where: { videoId, type: "LIKE" } });
    const dislikes = await prisma.reaction.count({ where: { videoId, type: "DISLIKE" } });

    // Hydrates logic variables depending on protection boundaries
    let userReaction = null;
    if (userId) {
      const reaction = await prisma.reaction.findUnique({
        where: { userId_videoId: { userId, videoId } }
      });
      if (reaction) userReaction = reaction.type;
    }

    return res.status(200).json({ likes, dislikes, userReaction });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return res.status(500).json({ error: "Failed to fetch reactions" });
  }
};

// Upsert mechanism modifying constrained states
export const reactToVideo = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { id: videoId } = req.params;
    const { type } = req.body; 

    const existingReaction = await prisma.reaction.findUnique({
      where: { userId_videoId: { userId, videoId } }
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Flushes entity on identical logic parameters
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
        return res.status(200).json({ message: "Reaction removed" });
      } else {
        // Transmutes static variable across domains
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type }
        });
        return res.status(200).json({ message: "Reaction updated" });
      }
    } else {
      // Instantiates mapped occurrence
      await prisma.reaction.create({
        data: { userId, videoId, type }
      });
      return res.status(200).json({ message: "Reaction added" });
    }
  } catch (error) {
    console.error("Error reacting to video:", error);
    return res.status(500).json({ error: "Failed to react" });
  }
};