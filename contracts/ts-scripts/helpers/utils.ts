import { Contract, ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";
import { networkConfigs, SupportedNetworks } from "./config";
import {
  ChowliveRoom__factory,
  ChowlivePaymentReceiver__factory,
  ChowlivePaymentRouter__factory,
} from "../ethers-contracts";
import "dotenv/config";
// import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem";

export interface DeployedAddresses {
  chowliveRoom: Record<number, string>;
  paymentReceiver: Record<number, string>;
  paymentRouter: Record<number, string>;
  erc20s: Record<number, string[]>;
  relationshipsVerified: boolean;
}

export function getWallet(
  network: SupportedNetworks | null,
  rpc?: string
): ethers.Wallet {
  const config = networkConfigs[network!];
  const provider = new ethers.providers.JsonRpcProvider(rpc || config.rpc);
  if (!process.env.PRIVATE_KEY) {
    throw Error(
      "No private key provided (use the PRIVATE_KEY environment variable)"
    );
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

// for VIEM Account
export function getAccount(network: SupportedNetworks) {
  if (!process.env.PRIVATE_KEY) {
    throw Error(
      "No private key provided (use the PRIVATE_KEY environment variable)"
    );
  }
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  return account;
}

export async function loadDeployedAddresses(): Promise<DeployedAddresses> {
  try {
    const data = readFileSync("./ts-scripts/testnet/deployed-addresses.json", {
      encoding: "utf-8",
    });
    return JSON.parse(data);
  } catch (error) {
    return {
      chowliveRoom: {},
      paymentReceiver: {},
      paymentRouter: {},
      erc20s: {},
      relationshipsVerified: false,
    };
  }
}

export async function storeDeployedAddresses(
  deployed: DeployedAddresses
): Promise<DeployedAddresses> {
  writeFileSync(
    "./ts-scripts/testnet/deployed-addresses.json",
    JSON.stringify(deployed, null, 2)
  );
  return deployed;
}

export async function getChowliveRoom(network: Chain) {
  const deployed = (await loadDeployedAddresses()).chowliveRoom[network.id];
  if (!deployed) {
    throw new Error(
      `No deployed ChowliveRoom on network ${SupportedNetworks[network.id]}`
    );
  }
  return ChowliveRoom__factory.connect(
    deployed,
    getWallet(null, network.rpcUrls.default.http[0])
  );
}

export async function getPaymentReceiver(network: SupportedNetworks) {
  const deployed = (await loadDeployedAddresses()).paymentReceiver[network];
  if (!deployed) {
    throw new Error(
      `No deployed PaymentReceiver on network ${SupportedNetworks[network]}`
    );
  }
  return ChowlivePaymentReceiver__factory.connect(deployed, getWallet(network));
}

export async function getPaymentRouter(network: SupportedNetworks) {
  const deployed = (await loadDeployedAddresses()).paymentRouter[network];
  if (!deployed) {
    throw new Error(
      `No deployed PaymentRouter on network ${SupportedNetworks[network]}`
    );
  }
  return ChowlivePaymentRouter__factory.connect(deployed, getWallet(network));
}

export const wait = (tx: ethers.ContractTransaction) => tx.wait();

export async function requestTokensFromFaucet(
  network: SupportedNetworks,
  targetAmount: ethers.BigNumber
) {
  const config = networkConfigs[network];
  if (!config.ccipBnMAddress) {
    throw new Error(
      `No faucet address available for network ${SupportedNetworks[network]}`
    );
  }

  const wallet = getWallet(network);
  const faucetABI = [
    "function drip(address to) external",
    "function balanceOf(address account) external view returns (uint256)",
  ];
  const faucetContract = new ethers.Contract(
    config.ccipBnMAddress,
    faucetABI,
    wallet
  );

  let amount = await faucetContract.balanceOf(wallet.address);
  let loopCount = 0;
  const maxLoops = 10;

  while (amount.lt(targetAmount) && loopCount < maxLoops) {
    console.log(
      `Current balance: ${ethers.utils.formatEther(
        amount
      )}. Requesting more tokens...`
    );
    const tx = await faucetContract.drip(wallet.address, { gasLimit: 500000 });
    await tx.wait();
    amount = await faucetContract.balanceOf(wallet.address);
    loopCount++;
  }

  console.log(
    `Final balance: ${ethers.utils.formatEther(
      amount
    )} after ${loopCount} drips`
  );
  return amount;
}

export async function areRelationshipsVerified(): Promise<boolean> {
  const deployed = await loadDeployedAddresses();
  return deployed.relationshipsVerified;
}

export async function setRelationshipsVerified(
  verified: boolean
): Promise<void> {
  const deployed = await loadDeployedAddresses();
  deployed.relationshipsVerified = verified;
  await storeDeployedAddresses(deployed);
}

export async function withdrawPEARL(chowliveRoom: Contract, network: Chain) {
  const rpc = network.rpcUrls.default.http[0];
  const signer = getWallet(null, rpc);
  const initialBalance = await signer.getBalance();

  console.log(
    "Initial deployer balance:",
    ethers.utils.formatEther(initialBalance),
    "PEARL"
  );
  const withdrawTx = await chowliveRoom.connect(signer).withdrawPEARL();
  await withdrawTx.wait();

  const finalBalance = await signer.getBalance();
  console.log(
    "Final deployer balance:",
    ethers.utils.formatEther(finalBalance),
    "PEARL"
  );

  const difference = finalBalance.sub(initialBalance);
  console.log("PEARL withdrawn:", ethers.utils.formatEther(difference));
}

export async function waitForFinality() {
  return new Promise<void>((resolve) => {
    console.log("Waiting for 1 minute to ensure finality...");
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingSeconds = 60 - elapsedSeconds;
      console.log(`${remainingSeconds} seconds remaining...`);
    }, 5000); // Log every 5 seconds

    setTimeout(() => {
      clearInterval(interval);
      console.log("Finality period complete.");
      resolve();
    }, 60000); // 1 minute in milliseconds
  });
}

export default {
  getWallet,
  loadDeployedAddresses,
  storeDeployedAddresses,
  getChowliveRoom,
  getPaymentReceiver,
  getPaymentRouter,
  wait,
  requestTokensFromFaucet,
  areRelationshipsVerified,
  setRelationshipsVerified,
};
