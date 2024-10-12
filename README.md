# Chowlive

Synchronized music playback for subscribed users

## Key Features

- Create and join music rooms as NFTs on Base Network
- Cross-chain subscriptions across Superchain and EVM networks
- User authentication via Spotify and Web3Auth

## Contracts

| Contract         | Network      | Address                                                                                                                         |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| ChowliveRoom     | Base Sepolia | [`0x0148E3A398678179be8B795725a2013eBbBD796F`](https://sepolia.basescan.org/address/0x0148E3A398678179be8B795725a2013eBbBD796F) |
| 
| Payment Router   | Sepolia      | [`0xBBCE884e234b40F591CC4009c4F15f72d89Ec4e2`](https://sepolia.etherscan.io/address/0xBBCE884e234b40F591CC4009c4F15f72d89Ec4e2) |

Note: The test scripts will deploy new instances of these contracts.

## Testing

### Prerequisites

1. open in terminal:
   ```
   cd contracts
   ```
2. Install dependencies, build contracts and generate typechain:
   ```
   npm run build
   ```
3. Create and add your private key to the `.env` file in the contracts directory:
   ```
   PRIVATE_KEY=0x...
   ```

### Funding Your Account

Before running the tests, ensure you have sufficient ETH in both Ethereum Sepolia and Base Sepolia networks. You can obtain testnet ETH from the following faucets:

- [Chainlink Faucets](https://faucets.chain.link/sepolia)

Recommended amounts (including buffer):

- Ethereum Sepolia: At least 0.05 ETH
- Base Sepolia: At least 0.01 ETH

### Running Tests

1. Base Sepolia Test:

   ```
   npm run base-test
   ```

   This test deploys the ChowliveRoom contract and performs a same-chain subscription.

2. Cross-Chain (CCIP) Test:
   ```
   npm run ccip-test
   ```
   This test deploys a PaymentRouter on Sepolia and performs a cross-chain subscription from Sepolia to Base Sepolia.

Note: The CCIP test requires the base test to be run first, as it uses the deployed ChowliveRoom contract address.

### Test Details

- The tests will mint BnM tokens (sample subscription tokens) if your account doesn't have enough.
- Approximate costs:
  - Base test: ~0.001 ETH on Base Sepolia
  - CCIP test: ~0.05 ETH on Sepolia (including contract deployment and CCIP fees)

Please ensure you have more than these amounts to account for potential gas price fluctuations.

## Client 


## References

- [Firebase Functions]()
- [Listen Together API]()

## Contributors

- [0xtinybird.eth]()
