import { Request, Response } from 'express';
import { processRequest } from '../services/requestService';

/**
 * Handles POST requests to process incoming data.
 * @param req client request containing the HTTP request data
 * @param res server response used to send the HTTP response
 */
export const handlePostRequest = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            res.status(400).json({ error: 'Bad Request: Missing body' });
            return;
        }
        if (!req.accessToken) {
            res.status(400).json({ error: 'Missing authentication token' });
            return;
        }
        const result = await processRequest(req.body, req.accessToken);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};