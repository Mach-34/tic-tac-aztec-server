import express from 'express';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { createServer } from 'node:http';
import bodyParser from 'body-parser';
import { user } from './controllers/user';
import DBClient from './mongo';
import dotenv from 'dotenv';
import { game } from './controllers/game';
import { finalizeTurn, joinGame, openChannel, signOpponentTurn, startGame, turn } from './controllers/socketEvents';
dotenv.config();

const { MONGO_DB_NAME, MONGO_URL } = process.env;

const app = express();
const port = 8000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

app.use(bodyParser.json());
app.use(cors());


server.listen(port, async () => {
    const client = new DBClient(MONGO_URL!, MONGO_DB_NAME!);
    await client.init();

    // Register HTTP routes
    app.use('/game', game(client));
    app.use('/user', user(client));

    // Setup up socket.io event listeners
    io.on("connection", (socket: Socket) => {
        // socket.on('game:answerTimeout')
        socket.on('game:join', joinGame(socket, client));
        socket.on('game:openChannel', openChannel(socket, client));
        socket.on('game:finalizeTurn', finalizeTurn(socket, client))
        socket.on('game:signOpponentTurn', signOpponentTurn(socket, client))
        socket.on('game:start', startGame(socket, client));
        // socket.on('game:triggerTimeout')
        socket.on('game:turn', turn(socket, client));
    });

    console.log(`Example app listening at http://localhost:${port}`);
});