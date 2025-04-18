import express from 'express';
import * as flowController from '../controllers/flowController';

const router = express.Router();

// POST endpoint to find matching flow options based on user message
router.post('/find-matches', flowController.findMatches);

// GET endpoint to continue the flow based on selected option ID
router.get('/continue-flow', flowController.continueFlow);

// GET endpoint to fetch flow options by parentId
router.get('/flow-options', flowController.getFlowOptionsByParentId);

export default router;