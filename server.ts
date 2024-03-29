import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "node:http";
import bodyParser from "body-parser";
import { createAccount } from "@aztec/accounts/testing";
import { createPXEClient } from "@aztec/aztec.js";
import DBClient from "./mongo";
import dotenv from "dotenv";
import { game } from "./controllers/game";
import { initContract, nudge } from "./utils/contract";
import {
    answerTimeout,
    finalizeTurn,
    joinGame,
    openChannel,
    signOpponentTurn,
    startGame,
    submitGame,
    triggerTimeout,
    turn,
} from "./controllers/socketEvents";
import { TTZSocketEvent } from "./utils/types";

dotenv.config();

const { MONGO_DB_NAME, MONGO_URL, PXE_URL } = process.env;

const app = express();
const port = 8000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});

app.use(bodyParser.json());
app.use(cors());

server.listen(port, async () => {
    console.log("Connecting to DB...");
    const client = new DBClient(MONGO_URL!, MONGO_DB_NAME!);
    await client.init();
    // init connection to pxe
    const pxe = createPXEClient(PXE_URL!);
    const deployer = await createAccount(pxe);

    // check for existing contract or deploy new one
    const contractAddress = await initContract(client, deployer);

    // List of open games
    // const openGames: string[] = [];

    // Register HTTP routes
    app.use("/game", game(client));

    // Setup up socket.io event listeners
    io.on("connection", (socket: Socket) => {
        socket.on(TTZSocketEvent.AnswerTimeout, answerTimeout(socket));
        socket.on(TTZSocketEvent.FinalizeTurn, finalizeTurn(socket));
        socket.on(TTZSocketEvent.JoinGame, joinGame(socket, client));
        socket.on(TTZSocketEvent.OpenChannel, openChannel(socket));
        socket.on(TTZSocketEvent.SignOpponentTurn, signOpponentTurn(socket));
        socket.on(TTZSocketEvent.StartGame, startGame(socket, client));
        socket.on(TTZSocketEvent.SubmitGame, submitGame(socket))
        socket.on(TTZSocketEvent.TriggerTimeout, triggerTimeout(socket));
        socket.on(TTZSocketEvent.Turn, turn(socket));
    });
    console.log(`Tic Tac Aztec Server listening at http://localhost:${port}`);

    // set interval for calling nudge every 30 seconds
    setInterval(() => {
        nudge(contractAddress, deployer);
    }, 30000);
});
