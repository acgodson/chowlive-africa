// config.ts

export enum SupportedNetworks {
  BASE_SEPOLIA,
  ETHEREUM_SEPOLIA,
  OPTIMISM_SEPOLIA,
  AVALANCHE_FUJI,
}

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
  [SupportedNetworks.BASE_SEPOLIA]: {
    description: "Base Sepolia Testnet",
    chainSelector: "10344971235874465080",
    rpc: "https://sepolia.base.org",
    routerAddress: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    linkTokenAddress: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    ccipBnMAddress: "0x88A2d74F47a237a62e7A51cdDa67270CE381555e",
    ccipLnMAddress: "0xA98FA8A008371b9408195e52734b1768c0d1Cb5c",
  },
  [SupportedNetworks.ETHEREUM_SEPOLIA]: {
    description: "Ethereum Sepolia Testnet",
    chainSelector: "16015286601757825753",
    rpc: "https://eth-sepolia.g.alchemy.com/v2/PB4BbHeft6sndMHQG464LiXM1jl4n29m",
    routerAddress: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    wrappedNativeAddress: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534",
    ccipBnMAddress: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05",
    ccipLnMAddress: "0x466D489b6d36E7E3b824ef491C225F5830E81cC1",
  },
  [SupportedNetworks.AVALANCHE_FUJI]: {
    description: "Avalanche Fuji Testnet",
    chainSelector: "14767482510784806043",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    routerAddress: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    linkTokenAddress: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    wrappedNativeAddress: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    ccipBnMAddress: "0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4",
    ccipLnMAddress: "0x70F5c5C40b873EA597776DA2C21929A8282A3b35",
  },

  [SupportedNetworks.OPTIMISM_SEPOLIA]: {
    description: "Optimism Sepolia Testnet",
    chainSelector: "5224473277236331295",
    rpc: "https://optimism-sepolia.infura.io/v3/2SYhsNBoKVT0rc90QfGmgHe46j4",
    routerAddress: "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57",
    linkTokenAddress: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    wrappedNativeAddress: "0x4200000000000000000000000000000000000006",
    ccipBnMAddress: "0x8aF4204e30565DF93352fE8E1De78925F6664dA7",
    ccipLnMAddress: "0x044a6B4b561af69D2319A2f4be5Ec327a6975D0a",
  },
};

export function getNetworkConfig(network: SupportedNetworks): NetworkConfig {
  const config = networkConfigs[network];
  if (!config) {
    throw new Error(
      `Network configuration not found for ${SupportedNetworks[network]}`
    );
  }
  return config;
}

export function getDummyTokensFromNetwork(network: SupportedNetworks): {
  ccipBnM: string;
  ccipLnM: string;
} {
  const config = getNetworkConfig(network);
  return { ccipBnM: config.ccipBnMAddress, ccipLnM: config.ccipLnMAddress };
}

export interface DeployedAddresses {
  chowliveRoom: Record<number, string>;
  paymentRouter: Record<number, string>;
  erc20s: Record<number, string[]>;
}

export default {
  networkConfigs,
  getNetworkConfig,
  getDummyTokensFromNetwork,
};
