import { Socket } from "socket.io";
import DBClient from "../mongo";
import { AnswerTimeoutPayload, FinalizeTurnPayload, JoinGamePayload, OpenChannelPayload, SignTurnPayload, StartGamePayload, TTZSocketEvent, TimeoutTriggeredPayload, TurnPayload } from "../utils/types";
import { ObjectId } from "mongodb";

//  TODO: Combine this with turn?
export const answerTimeout = (socket: Socket) => async (data: AnswerTimeoutPayload, callback: any) => {


    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit(TTZSocketEvent.AnswerTimeout, data);

    const res = { status: 'success' };
    callback(res);
}

export const joinGame = (socket: Socket, db: DBClient) => async (data: JoinGamePayload, callback: any) => {
    const gameCollection = db.getTable('games');
    const { address, id, mongoId, signature } = data;

    const query = { _id: new ObjectId(mongoId as string) };
    await gameCollection.deleteOne(query);
    // TODO: Change game room id away from mongo id?
    // socket.join(id);
    // Emit joined
    // TODO: Switch back to room
    // socket.to(id).emit('game:join', result);
    socket.broadcast.emit(TTZSocketEvent.JoinGame, { address, id, signature });

    const res = { status: 'success' };
    callback(res);
}

export const openChannel = (socket: Socket) => async (data: OpenChannelPayload, callback: any) => {
    const { openChannelResult } = data;

    socket.broadcast.emit(TTZSocketEvent.OpenChannel, { openChannelResult });
    const res = { status: 'success' };
    callback(res);
}

export const finalizeTurn = (socket: Socket) => async (data: FinalizeTurnPayload, callback: any) => {

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:signOpponentTurn', result);
    socket.broadcast.emit(TTZSocketEvent.FinalizeTurn, data);

    const res = { status: 'success' };
    callback(res);
}

export const signOpponentTurn = (socket: Socket) => async (data: SignTurnPayload, callback: any) => {
    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:signOpponentTurn', result);
    socket.broadcast.emit(TTZSocketEvent.SignOpponentTurn, data);

    const res = { status: 'success' };
    callback(res);
}

export const startGame = (socket: Socket, db: DBClient) => async (data: StartGamePayload, callback: any) => {
    const { address } = data;
    const gameCollection = db.getTable('games');
    const { insertedId } = await gameCollection.insertOne({ host: address });


    // TODO: Change game room id away from mongo id?
    // socket.join(insertedId.toString());
    socket.broadcast.emit(TTZSocketEvent.StartGame, { host: address, mongoId: insertedId.toString() });

    // Send back game id in callback
    const res = {
        status: 'success'
    };
    callback(res)
}

export const submitGame = (socket: Socket) => async (_: undefined, callback: any) => {

    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit(TTZSocketEvent.SubmitGame);

    const res = { status: 'success' };
    callback(res);
}

export const triggerTimeout = (socket: Socket) => async (data: TimeoutTriggeredPayload, callback: any) => {
    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit(TTZSocketEvent.TriggerTimeout, data);

    const res = { status: 'success' };
    callback(res);
}

export const turn = (socket: Socket) => async (data: TurnPayload, callback: any) => {
    // Emit signed channel
    // TODO: Switch back to room
    // socket.to(id).emit('game:turn', result);
    socket.broadcast.emit(TTZSocketEvent.Turn, data);

    const res = { status: 'success' };
    callback(res);
}