import { Socket } from "socket.io";
import DBClient from "../mongo";
import { ObjectId, ReturnDocument } from "mongodb";

export const gameSubmitted = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit('game:gameSubmitted');

    const res = { status: 'success' };
    callback(res);
}

export const joinGame = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { address, gameId, id, signature } = data;

    // TODO: Ensure challenger is not in game

    const query = { _id: new ObjectId(id as string) };
    const update = {
        $set: {
            challenger: address,
            challengerOpenSignature: signature,
            gameId
        }
    };
    const options = { returnDocument: ReturnDocument.AFTER };
    const result = await gameCollection.findOneAndUpdate(query, update, options);
    // TODO: Change game room id away from mongo id?
    // socket.join(id);
    // Emit joined
    // TODO: Switch back to room
    // socket.to(id).emit('game:join', result);
    socket.broadcast.emit('game:join', result);

    const res = { status: 'success', game: result };
    callback(res);
}

export const openChannel = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, openChannelResult } = data;

    const query = { _id: new ObjectId(id as string) };
    const update = {
        $set: {
            "executionResults.open": openChannelResult
        }
    };
    const options = { returnDocument: ReturnDocument.AFTER };
    const result = await gameCollection.findOneAndUpdate(query, update, options);

    socket.broadcast.emit('game:openChannel', result);
    const res = { status: 'success', game: result };
    callback(res);
}

export const finalizeTurn = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, turnResult } = data;

    const query = { _id: new ObjectId(id as string) };
    const update =
    {
        $push: {
            "executionResults.turn": turnResult
        },
        $inc: {
            "turnIndex": 1
        }
    };
    const options = { returnDocument: ReturnDocument.AFTER };

    const result = await gameCollection.findOneAndUpdate(query, update, options);

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:signOpponentTurn', result);
    socket.broadcast.emit('game:signOpponentTurn', result);

    const res = { status: 'success', game: result };
    callback(res);
}

export const signOpponentTurn = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, signature, turnIndex } = data;

    const query = { _id: new ObjectId(id as string) };
    const update =
    {
        $set: {
            [`turns.${turnIndex}.opponentSignature`]: signature
        }
    };
    const options = { returnDocument: ReturnDocument.AFTER };

    const result = await gameCollection.findOneAndUpdate(query, update, options);

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:signOpponentTurn', result);
    socket.broadcast.emit('game:signOpponentTurn', result);

    const res = { status: 'success', game: result };
    callback(res);
}

// TODO: Create start game data type
export const startGame = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { address } = data;
    const game = {
        host: address,
        challenger: '',
        challengerOpenSignature: undefined,
        executionResults: {
            orchestrator: undefined,
            open: undefined,
            turn: []
        },
        gameId: '',
        timeout: undefined,
        turns: [],
        turnIndex: 0
    }
    const { insertedId } = await gameCollection.insertOne(game);
    // TODO: Change game room id away from mongo id?
    // socket.join(insertedId.toString());
    socket.broadcast.emit('game:start', { ...game, _id: insertedId });

    // Send back game id in callback
    const res = {
        status: 'success', game: { ...game, _id: insertedId }
    };
    callback(res)
}

//  TODO: Combine this with turn?
export const timeoutAnswered = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, move } = data;
    const query = { _id: new ObjectId(id as string) };

    const update = {
        $inc: {
            "turnIndex": 1
        },
        $push: {
            turns: move,
        }
    };
    const options = { returnDocument: ReturnDocument.AFTER };

    const result = await gameCollection.findOneAndUpdate(query, update, options);

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit('game:timeoutAnswered', result);

    const res = { status: 'success', game: result };
    callback(res);
}

export const timeoutTriggered = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, turnResult } = data;

    // If id is not defined then this timeout was triggered without a signature returned
    if (id) {
        const query = { _id: new ObjectId(id as string) };
        const update =
        {
            $inc: {
                "turnIndex": 1
            },
            $push: {
                "executionResults.turn": turnResult
            }
        };
        const options = { returnDocument: ReturnDocument.AFTER };

        const result = await gameCollection.findOneAndUpdate(query, update, options);

        socket.broadcast.emit('game:timeoutTriggered', result);

        const res = { status: 'success', game: result };
        callback(res);
    } else {

        // Emit signed channel
        // TODO: Switch back to room
        // socket.to(id).emit('game:turn', result);
        socket.broadcast.emit('game:timeoutTriggered');

        const res = { status: 'success' };
        callback(res);
    }
}

export const turn = (socket: Socket, db: DBClient) => async (data: any, callback: any) => {
    const gameCollection = db.getTable('games');
    const { id, move } = data;
    const query = { _id: new ObjectId(id as string) };

    const update = {
        $push: {
            turns: move,
        },
    };
    const options = { returnDocument: ReturnDocument.AFTER };

    const result = await gameCollection.findOneAndUpdate(query, update, options);

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit('game:turn', result);

    const res = { status: 'success', game: result };
    callback(res);
}