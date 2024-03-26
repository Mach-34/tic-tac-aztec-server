import { Router, Request, Response } from "express"
import { getContractAddress } from "../utils/contract";
import DBClient from "../mongo"

export const game = (db: DBClient) => {
    const router = Router();
    const gameCollection = db.getTable('games');
    const contractCollection = db.getTable('contracts');

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

    router.get('/contract', async (req: Request, res: Response) => {
        // return the contract address
        const contractAddress = await getContractAddress(db);
        if (contractAddress === undefined) {
            res.status(404).send({ message: 'No contract found' });
            return;
        }
        console.log("result: ", contractAddress);
        res.status(200).send({ address: contractAddress });
    });

    return router;
}

