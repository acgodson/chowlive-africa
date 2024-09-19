import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User } from 'firebase/auth';
import { OpenloginUserInfo } from '@web3auth/openlogin-adapter';

import { Contract, ethers } from 'ethers';

import { Chain } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type SupportedNetworks = 1 | 2;

export type AuthContextType = {
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  loggedIn: boolean;
  web3User: Partial<OpenloginUserInfo> | null;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  getUserInfo: () => void;
  getAccounts: () => void;
  getBalance: () => void;
  signMessage: () => void;
  authenticateUser: () => void;
  sendTransaction: () => void;
  logout: () => void;
};

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) {
    return '';
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'Invalid Address';
  }
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function getWallet(network: SupportedNetworks | null, rpc?: string): ethers.Wallet {
  const config = networkConfigs[network!];

  const provider = new ethers.providers.JsonRpcProvider(rpc || config.rpc);

  if (!process.env.PRIVATE_KEY) {
    throw Error('No private key provided (use the PRIVATE_KEY environment variable)');
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

export const wait = (tx: ethers.ContractTransaction) => tx.wait();

export async function requestTokensFromFaucet(
  network: SupportedNetworks,
  targetAmount: ethers.BigNumber
) {
  const config = networkConfigs[network];
  if (!config.ccipBnMAddress) {
    throw new Error(
      `No faucet address available for network ${networkConfigs[network].description}`
    );
  }

  const wallet = getWallet(network);
  const faucetABI = [
    'function drip(address to) external',
    'function balanceOf(address account) external view returns (uint256)',
  ];
  const faucetContract = new ethers.Contract(config.ccipBnMAddress, faucetABI, wallet);

  let amount = await faucetContract.balanceOf(wallet.address);
  let loopCount = 0;
  const maxLoops = 10;

  while (amount.lt(targetAmount) && loopCount < maxLoops) {
    console.log(`Current balance: ${ethers.utils.formatEther(amount)}. Requesting more tokens...`);
    const tx = await faucetContract.drip(wallet.address, { gasLimit: 500000 });
    await tx.wait();
    amount = await faucetContract.balanceOf(wallet.address);
    loopCount++;
  }

  console.log(`Final balance: ${ethers.utils.formatEther(amount)} after ${loopCount} drips`);
  return amount;
}

export async function withdrawPEARL(chowliveRoom: Contract, network: Chain) {
  const rpc = network.rpcUrls.default.http[0];
  const signer = getWallet(null, rpc);
  const initialBalance = await signer.getBalance();

  console.log('Initial deployer balance:', ethers.utils.formatEther(initialBalance), 'PEARL');
  const withdrawTx = await chowliveRoom.connect(signer).withdrawPEARL();
  await withdrawTx.wait();

  const finalBalance = await signer.getBalance();
  console.log('Final deployer balance:', ethers.utils.formatEther(finalBalance), 'PEARL');

  const difference = finalBalance.sub(initialBalance);
  console.log('PEARL withdrawn:', ethers.utils.formatEther(difference));
}

export async function waitForFinality() {
  return new Promise<void>((resolve) => {
    console.log('Waiting for 1 minute to ensure finality...');
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingSeconds = 60 - elapsedSeconds;
      console.log(`${remainingSeconds} seconds remaining...`);
    }, 5000); // Log every 5 seconds

    setTimeout(() => {
      clearInterval(interval);
      console.log('Finality period complete.');
      resolve();
    }, 60000); // 1 minute in milliseconds
  });
}

export const wait5Seconds = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('5 seconds have passed');
    }, 5000);
  });
};

export interface NetworkConfig {
  description: string;
  chainSelector: string;
  rpc: string;
  routerAddress: string;
  linkTokenAddress: string;
  wrappedNativeAddress: string;
  ccipBnMAddress: string;
  ccipLnMAddress: string;
  faucetAddress?: string;
}

export const networkConfigs: { [key in SupportedNetworks]: NetworkConfig } = {
  1: {
    description: 'Ethereum Sepolia Testnet',
    chainSelector: '16015286601757825753',
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/PB4BbHeft6sndMHQG464LiXM1jl4n29m',
    routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    linkTokenAddress: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    wrappedNativeAddress: '0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534',
    ccipBnMAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
    ccipLnMAddress: '0x466D489b6d36E7E3b824ef491C225F5830E81cC1',
  },
  2: {
    description: 'Avalanche Fuji Testnet',
    chainSelector: '14767482510784806043',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    routerAddress: '0xF694E193200268f9a4868e4Aa017A0118C9a8177',
    linkTokenAddress: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
    wrappedNativeAddress: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
    ccipBnMAddress: '0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4',
    ccipLnMAddress: '0x70F5c5C40b873EA597776DA2C21929A8282A3b35',
  },
};

export function getDummyTokensFromNetwork(network: SupportedNetworks): {
  ccipBnM: string;
  ccipLnM: string;
} {
  const config = networkConfigs[network];
  return { ccipBnM: config.ccipBnMAddress, ccipLnM: config.ccipLnMAddress };
}
