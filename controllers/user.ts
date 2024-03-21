import { Router, Request, Response } from "express"
import DBClient from "../mongo"

export const user = (db: DBClient) => {
    const router = Router();
    const userCollection = db.getTable('users');

    router.get('/nonce', async (req: Request, res: Response) => {
        // Check that user exists. If not then insert address and initialize nonce to 0
        const address = req.headers['x-address'];

        const query = { address: address };

        const options = {
            upsert: true,
            returnOriginal: false
        }

        // Only update if user does not exist
        const update = {
            $setOnInsert: {
                address: address,
                nonce: 0,
            }
        };

        const result = await userCollection.findOneAndUpdate(query, update, options);
        res.status(200).send({ nonce: result ? result.nonce : 0 });
    });

    return router;
}

