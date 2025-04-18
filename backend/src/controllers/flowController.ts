import { Request, Response } from 'express';
import FlowService from '../services/FlowService';

export const findMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    console.log(message)

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const similarOptions = await FlowService.findSimilarOptions(message);

    // Log if no options were returned
    if (!similarOptions || similarOptions.length === 0) {
      console.error('No similar options returned from service for message:', message);
    }

    console.log(similarOptions)

    // Ensure we return at least 2 and at most 5 options
    const limitedOptions = similarOptions.slice(0, Math.max(2, Math.min(similarOptions.length, 5)));

    res.json({ options: limitedOptions });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'An error occurred while finding matches' });
  }
};

export const continueFlow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { optionId } = req.query;

    if (!optionId || typeof optionId !== 'string') {
      res.status(400).json({ error: 'Option ID is required' });
      return;
    }

    const childOptions = await FlowService.getContinueFlow(optionId);

    res.json({ options: childOptions });
  } catch (error) {
    console.error('Error continuing flow:', error);
    res.status(500).json({ error: 'An error occurred while continuing flow' });
  }
};

export const getFlowOptionsByParentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId } = req.query;

    if (!parentId || typeof parentId !== 'string') {
      res.status(400).json({ error: 'Parent ID is required' });
      return;
    }

    const options = await FlowService.getFlowOptionsByParentId(parentId);

    res.json({ options });
  } catch (error) {
    console.error('Error getting flow options by parentId:', error);
    res.status(500).json({ error: 'An error occurred while fetching flow options' });
  }
};