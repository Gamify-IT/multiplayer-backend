import { Request, Response } from 'express';
import { processRequest } from '../services/requestService';

export const handlePostRequest = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            res.status(400).json({ error: 'Bad Request: Missing body' });
            return;
        }
        const result = await processRequest(req.body);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};