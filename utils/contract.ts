import "dotenv/config";
import {
  AztecAddress,
  createPXEClient,
  AccountWalletWithPrivateKey,
} from "@aztec/aztec.js";
import { createAccount } from "@aztec/accounts/testing";
import { TicTacToeContract } from "@mach-34/aztec-state-channels";
import DBClient from "../mongo";

const { PXE_URL } = process.env;
/**
 * Attempt to retrieve a contract address from the database
 *
 * @param db - instantiated database client connection
 * @returns - the contract address if found, otherwise undefined
 */
export const getContractAddress = async (
  db: DBClient
): Promise<string | undefined> => {
  const contractCollection = db.getTable("contracts");
  const result = await contractCollection.findOne(
    {},
    { projection: { address: 1 } }
  );
  return result === null ? undefined : result?.address;
};

/**
 * Checks for a contract address in the database, if not found, deploys a new contract
 *
 * @notice Run on server start
 * @param db - instantiated database client connection
 */
export const initContract = async (
  db: DBClient,
  from: AccountWalletWithPrivateKey
): Promise<AztecAddress> => {
  // check if contract is already deployed
  const contractAddress = await getContractAddress(db);
  if (contractAddress) {
    console.log(`Found contract "${contractAddress}" in DB`);
    // check that contract exists in PXE
    let address = AztecAddress.fromString(contractAddress);
    try {
      await TicTacToeContract.at(address, from);
      console.log("Contract confirmed to exist in PXE, no deployment needed");
      return address;
    } catch (e) {
      console.log(`Contract not found in PXE, deploying new contract...`);
      // delete any old contract addresses from the DB
      await db.getTable("contracts").drop();
    }
  }
  // Deploy new contract
  console.log("Deploying new contract...");
  const deployed = await TicTacToeContract.deploy(from)
    .send()
    .deployed()
    .then((res: any) => res.address);
  // Save contract address to DB
  await db.getTable("contracts").insertOne({ address: deployed.toString() });
  console.log(
    "Registered new TicTacToe contract at address: ",
    deployed.toString()
  );
  return deployed;
};

/**
 * Nonfunctional public function in contract used to advance blocks on chain
 * @notice used to ensure timeouts can be simulated
 * 
 * @param contractAddress - address of the contract to call
 * @param from - account used to send transactions
 */
export const nudge = async (
  contractAddress: AztecAddress,
  from: AccountWalletWithPrivateKey
) => {
    // get the contract
    const contract = await TicTacToeContract.at(contractAddress, from);
    // call nudge
    contract.methods.nudge().send().wait();
    console.log(`Nudge executed at ${new Date().toISOString()}`);
};
