import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "node:http";
import bodyParser from "body-parser";
import { createAccount } from "@aztec/accounts/testing";
import { createPXEClient } from "@aztec/aztec.js";
import { user } from "./controllers/user";
import DBClient from "./mongo";
import dotenv from "dotenv";
import { game } from "./controllers/game";
import { initContract, nudge } from "./utils/contract";
import {
  finalizeTurn,
  joinGame,
  openChannel,
  signOpponentTurn,
  startGame,
  timeoutTriggered,
  turn,
} from "./controllers/socketEvents";

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

  // Register HTTP routes
  app.use("/game", game(client));
  app.use("/user", user(client));

  // Setup up socket.io event listeners
  io.on("connection", (socket: Socket) => {
    // socket.on('game:answerTimeout')
    socket.on("game:join", joinGame(socket, client));
    socket.on("game:openChannel", openChannel(socket, client));
    socket.on("game:finalizeTurn", finalizeTurn(socket, client));
    socket.on("game:signOpponentTurn", signOpponentTurn(socket, client));
    socket.on("game:start", startGame(socket, client));
    socket.on("game:timeoutTriggered", timeoutTriggered(socket, client));
    socket.on("game:turn", turn(socket, client));
  });

  console.log(`Tic Tac Aztec Server listening at http://localhost:${port}`);

  // set interval for calling nudge every 30 seconds
  setInterval(() => {
    nudge(contractAddress, deployer);
  }, 30000);
});
