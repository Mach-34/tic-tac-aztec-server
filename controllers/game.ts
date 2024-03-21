import { Router, Request, Response } from "express"
import DBClient from "../mongo"

export const game = (db: DBClient) => {
    const router = Router();
    const gameCollection = db.getTable('games');

    router.get('/pending', async (req: Request, res: Response) => {
        const query = { challenger: '' };
        const result = await gameCollection.find(query).toArray();
        res.status(200).send(result);
    });

    router.get('/in-game', async (req: Request, res: Response) => {
        // Extract user address from header
        const address = req.headers['x-address']
        const query = { $or: [{ host: address }, { challenger: address }] }
        const result = await gameCollection.findOne(query);
        res.status(200).send({ game: result });
    });

    return router;
}

