import { Router } from 'express';
import { handlePostRequest } from '../controllers/requestController';

const router = Router();
router.post('/join', handlePostRequest);

export default router;