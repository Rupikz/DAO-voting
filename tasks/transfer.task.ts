/* eslint node/no-unpublished-import: "off", curly: "error" */
import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("transfer", "Transfer tokens from account.")
  .addParam("recipient", "The recipient's address")
  .addParam("amount", "The amount of token")
  .setAction(async (args: TaskArguments, hre) => {
    const contractAddress = <string>process.env.TASK_CONTRACT_ADDRESS;
    if (!contractAddress) {
      console.error(
        "\x1b[31m",
        "ERROR: Specify the 'TASK_CONTRACT_ADDRESS' variable in the .env file."
      );
      return;
    }
    const Token = await hre.ethers.getContractFactory("Token");
    const token = Token.attach(contractAddress);
    await token.transfer(args.recipient, args.amount);
  });

module.exports = {};
