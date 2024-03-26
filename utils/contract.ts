import "dotenv/config";
import { AztecAddress, createPXEClient } from "@aztec/aztec.js";
import { createAccount } from "@aztec/accounts/testing";
import { TicTacToeContract } from "../artifacts/TicTacToe";
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
  console.log("Result: ", result);
  return result === null ? undefined : result?.address;
};

/**
 * Checks for a contract address in the database, if not found, deploys a new contract
 *
 * @notice Run on server start
 * @param db - instantiated database client connection
 */
export const initContract = async (db: DBClient) => {
  // init connection to PXE
  const pxe = createPXEClient(PXE_URL!);
  // check if contract is already deployed
  const contractAddress = await getContractAddress(db);
  if (contractAddress) {
    console.log(`Found contract "${contractAddress}" in DB`);
    // check that contract exists in PXE
    try {
      await TicTacToeContract.at(AztecAddress.fromString(contractAddress), pxe);
      console.log("Contract confirmed to exist in PXE, no deployment needed");
      return;
    } catch (e) {
      console.log(`Contract not found in PXE, deploying new contract...`);
      // delete any old contract addresses from the DB
      await db.getTable("contracts").drop();
    }
  }
  // Deploy new contract
  console.log("Deploying new contract...");
  const deployer = await createAccount(pxe);
  const deployed = await TicTacToeContract.deploy(deployer)
    .send()
    .deployed()
    .then((res: any) => res.address.toString());
  // Save contract address to DB
  await db.getTable("contracts").insertOne({ address: deployed });
  console.log("Registered new TicTacToe contract at address: ", deployed);
};
