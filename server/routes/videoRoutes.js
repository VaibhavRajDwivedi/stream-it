import express from 'express';
import { getAllVideos, createVideo, getVideoById, getVideosByUser, deleteVideo, searchVideos, getRecommendations , logWatchHistory, getWatchHistory, removeFromHistory, getHomeFeed, addView , reactToVideo , getVideoReactions} from '../controllers/videoController.js';
import { protectRoute, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();



router.get('/', getAllVideos);

router.post('/', createVideo);

router.get('/feed', optionalAuth, getHomeFeed);

router.get('/search', searchVideos);

router.get('/history', protectRoute, getWatchHistory);
router.delete('/history/:videoId', protectRoute, removeFromHistory);


router.get('/:id/reactions', optionalAuth, getVideoReactions);
router.post('/:id/react', protectRoute, reactToVideo);

router.put('/:id/view', addView);
router.get('/:id/recommendations', getRecommendations);
router.post('/:id/watch', protectRoute, logWatchHistory);

router.get('/:id', getVideoById);


router.get('/user/:userId', getVideosByUser);
router.delete('/:id', deleteVideo);

export default router;