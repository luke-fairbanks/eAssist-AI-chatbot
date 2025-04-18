import express from 'express';
import * as chatLogController from '../controllers/chatLogController';

const router = express.Router();

// POST endpoint to start a new chat session
router.post('/sessions', chatLogController.startChatSession);

// POST endpoint to add a message to a chat session
router.post('/sessions/message', chatLogController.addMessageToSession);

// PUT endpoint to end a chat session
router.put('/sessions/:sessionId/end', chatLogController.endChatSession);

// GET endpoint to fetch chat logs
router.get('/logs', chatLogController.getChatLogs);

// GET endpoint to fetch a specific chat session
router.get('/sessions/:sessionId', chatLogController.getChatSession);

export default router;