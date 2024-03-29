import { Router, Request, Response } from "express"
import { getContractAddress } from "../utils/contract";
import DBClient from "../mongo"

export const game = (db: DBClient) => {
    const router = Router();
    const gameCollection = db.getTable('games');

    router.get('/open', async (_: Request, res: Response) => {
        const query = { challenger: '' };
        const result = await gameCollection.find(query).toArray();
        res.status(200).send(result);
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

