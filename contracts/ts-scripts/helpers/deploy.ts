import { SupportedNetworks, getNetworkConfig } from "./config";
import {
  getWallet,
  loadDeployedAddresses,
  storeDeployedAddresses,
} from "./utils";
import {
  ChowliveRoom__factory,
  ChowlivePaymentRouter__factory as PaymentRouter__factory,
} from "../ethers-contracts";
import { Chain, parseEther } from "viem";

export async function deployChowliveRoom(network: Chain) {
  const rpc = network.rpcUrls.default.http[0];
  const signer = getWallet(null, rpc);
  const roomCreationFee = parseEther("0.0001"); // 0.0001 ETH for room creation

  // Get the CCIP router address for Base Sepolia
  const baseSepoliaConfig = getNetworkConfig(SupportedNetworks.BASE_SEPOLIA);
  const ccipRouterAddress = baseSepoliaConfig.routerAddress;

  const chowliveRoom = await new ChowliveRoom__factory(signer).deploy(
    roomCreationFee,
    ccipRouterAddress
  );
  await chowliveRoom.deployed();

  console.log(
    `ChowliveRoom deployed to ${chowliveRoom.address} on network ${network.name}`
  );

  const deployed = await loadDeployedAddresses();
  deployed.chowliveRoom = deployed.chowliveRoom || {};
  deployed.chowliveRoom[network.id] = chowliveRoom.address;
  await storeDeployedAddresses(deployed);

  return chowliveRoom;
}

export async function deployPaymentRouter(
  network: SupportedNetworks,
  paymentReceiverAddress: string,
  targetNetwork: SupportedNetworks
) {
  const config = getNetworkConfig(network);
  const targetConfig = getNetworkConfig(targetNetwork);
  const signer = getWallet(network);

  const paymentRouter = await new PaymentRouter__factory(signer).deploy(
    config.routerAddress,
    config.linkTokenAddress,
    paymentReceiverAddress,
    config.ccipBnMAddress,
    targetConfig.chainSelector
  );
  await paymentRouter.deployed();

  console.log(
    `PaymentRouter deployed to ${paymentRouter.address} on network ${SupportedNetworks[network]}`
  );

  const deployed = await loadDeployedAddresses();
  deployed.paymentRouter = deployed.paymentRouter || {};
  deployed.paymentRouter[network] = paymentRouter.address;
  await storeDeployedAddresses(deployed);

  return paymentRouter;
}

export default {
  deployChowliveRoom,
  deployPaymentRouter,
};
