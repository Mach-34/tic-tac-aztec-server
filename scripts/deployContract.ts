import { createPXEClient } from "@aztec/aztec.js";
import { createAccount } from "@aztec/accounts/testing";
import { TicTacToeContract } from "../artifacts/TicTacToe";

(async () => {
    const PXE_URL = 'http://localhost:8080';
    const pxe = createPXEClient(PXE_URL);
    const deployer = await createAccount(pxe);
    console.log('Deploying Tic tac toe contract')
    const deployed = await TicTacToeContract.deploy(deployer)
        .send()
        .deployed();
    console.log('Tic tac toe deployed to: ', deployed.address.toString())
})();