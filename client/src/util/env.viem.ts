import {
  createWalletClient,
  createPublicClient,
  custom,
  formatEther,
  parseEther,
  Chain,
  Address,
  TransactionReceipt,
  getAddress,
  encodeFunctionData,
  http,
  parseEventLogs,
} from 'viem';
import { sepolia, avalancheFuji } from 'viem/chains';
import chowliveRoomABI from './abis/ChowliveRoom.json';
import { privateKeyToAccount } from 'viem/accounts';

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from '@web3auth/base';

const intersect: Chain = {
  id: 1612,
  name: 'Intersect Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pearl',
    symbol: 'PEARL',
  },
  rpcUrls: {
    default: {
      http: ['https://subnets.avax.network/pearl/testnet/rpc'],
    },
    public: {
      http: ['https://subnets.avax.network/pearl/testnet/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'Intersect Explorer', url: 'https://subnets-test.avax.network/intersect' },
  },
};

export default class EthereumRpc {
  private provider: IProvider;
  private chainConfigs: { [key: string]: Chain };

  private contractABI = [
    {
      inputs: [],
      name: 'retrieve',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'num',
          type: 'uint256',
        },
      ],
      name: 'store',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  constructor(provider: IProvider) {
    this.provider = provider;
    this.chainConfigs = {
      '0xaa36a7': sepolia,
      '0xa869': avalancheFuji,
      '0x64c': intersect,
    };
  }

  getViewChain(): Chain {
    return this.chainConfigs[this.provider.chainId] || avalancheFuji;
  }

  async getChainId(): Promise<string> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const chainId = await walletClient.getChainId();
      return `0x${chainId.toString(16)}`;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      throw error;
    }
  }

  async getAddresses(): Promise<any> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      return await walletClient.getAddresses();
    } catch (error) {
      return error;
    }
  }
  async getAccounts(): Promise<any> {
    try {
      const address = this.getAddresses();

      return address;
    } catch (error) {
      return error;
    }
  }

  async getPrivateKey(): Promise<any> {
    try {
      const privateKey = await this.provider.request({
        method: 'eth_private_key',
      });

      return privateKey;
    } catch (error) {
      return error as string;
    }
  }

  async getBalance(): Promise<string> {
    try {
      console.log('get view chain', this.getViewChain());
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const address = await this.getAccounts();
      const balance = await publicClient.getBalance({ address: address[0] });
      return formatEther(balance);
    } catch (error) {
      return error as string;
    }
  }
  async createRoom(
    isPublic = false,
    subscriptionFee: bigint | number,
    tokenAddress: Address
  ): Promise<{ hash: `0x${string}`; roomId: bigint }> {
    try {
      const walletClient = createWalletClient({
        chain: intersect,
        transport: http(
          'https://testnet-pearl-c612f.avax-test.network/ext/bc/CcXVATAg76vM849mrPoTigwp48qhFiN9WCa51DBQXNGkBKZw7/rpc?token=3296aa3e491dd5d366815601cc95be7275cd293486b09fe082619750d7b38587',
          {
            batch: true,
          }
        ),
      });

      const publicClient = createPublicClient({
        chain: intersect,
        transport: http(
          'https://testnet-pearl-c612f.avax-test.network/ext/bc/CcXVATAg76vM849mrPoTigwp48qhFiN9WCa51DBQXNGkBKZw7/rpc?token=3296aa3e491dd5d366815601cc95be7275cd293486b09fe082619750d7b38587',
          {
            batch: true,
          }
        ),
      });

      const [address] = await this.getAccounts();
      const privateKey = await this.getPrivateKey();

      console.log('Account Private Key:', privateKey);
      console.log('Using address:', address);

      const contractAddress = process.env.NEXT_PUBLIC_CHOWLIVE_ROOM as `0x${string}`;
      console.log('Contract address:', contractAddress);

      const data = encodeFunctionData({
        abi: chowliveRoomABI.abi,
        functionName: 'createRoom',
        args: [false, 0, getAddress(tokenAddress)],
      });

      const account = privateKeyToAccount(`0x${privateKey}`);
      const nounce = await publicClient.getTransactionCount({
        address: address,
      });
      console.log('nounce gotten', nounce);
      const hash = await walletClient.sendTransaction({
        account: account as unknown as any,
        to: contractAddress,
        value: parseEther('1'),
        data,
        gas: BigInt(3000000),
      });
      console.log('Transaction sent, hash:', hash);
      // Wait for the transaction receipt
      const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash });

      const logs = parseEventLogs({
        abi: chowliveRoomABI.abi,
        eventName: ['RoomCreated'],
        logs: receipt.logs,
      });

      // Find the RoomCreated event log
      const roomCreatedLog = receipt.logs.find(
        (log) =>
          log.topics[0] === '0x9885ea126188c43cc329e45aa9539d799811f0c00053a8f1db943aad926551e2'
      );

      if (!roomCreatedLog) {
        throw new Error('RoomCreated event not found in transaction logs');
      }
      // Extract roomId from the second topic
      const roomId = BigInt(roomCreatedLog.topics[1] || '0');

      console.log('emitting event says that this is the id', roomId.toString());

      return { hash, roomId };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async signMessage(message: string) {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // data for signing
      const address = await this.getAccounts();

      // Sign the message
      const hash = await walletClient.signMessage({
        account: address[0],
        message: message,
      });

      console.log(hash);

      return hash.toString();
    } catch (error) {
      return error;
    }
  }

  async readContract() {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const number = await publicClient.readContract({
        address: '0x9554a5CC8F600F265A89511e5802945f2e8A5F5D',
        abi: this.contractABI,
        functionName: 'retrieve',
      });

      return this.toObject(number);
    } catch (error) {
      return error;
    }
  }

  async writeContract() {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider),
      });

      // data for writing to the contract
      const address = await this.getAccounts();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;

      // Submit transaction to the blockchain
      const hash = await walletClient.writeContract({
        account: address[0],
        address: '0x9554a5CC8F600F265A89511e5802945f2e8A5F5D',
        abi: this.contractABI,
        functionName: 'store',
        args: [randomNumber],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt);
    } catch (error) {
      return error;
    }
  }

  toObject(data: any) {
    // can't serialize a BigInt so this hack
    return JSON.parse(
      JSON.stringify(
        data,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
      )
    );
  }
}
