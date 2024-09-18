import { SupportedNetworks, getNetworkConfig } from "./config";
import {
  getAccount,
  getWallet,
  loadDeployedAddresses,
  storeDeployedAddresses,
  wait,
} from "./utils";
import {
  ChowliveRoom__factory,
  ChowlivePaymentReceiver__factory as PaymentReceiver__factory,
  ChowlivePaymentRouter__factory as PaymentRouter__factory,
} from "../ethers-contracts";
import { Chain, parseEther } from "viem";

export async function deployChowliveRoom(network: Chain) {
  const rpc =  network.rpcUrls.default.http[0];

  const signer = getWallet(null,rpc);
  const roomCreationFee = parseEther("1"); // 1 PEARL for room creation

  const chowliveRoom = await new ChowliveRoom__factory(signer).deploy(
    roomCreationFee
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

export async function deployPaymentReceiver(
  network: SupportedNetworks,
  chowliveRoomAddress: string
) {
  const config = getNetworkConfig(network);
  const signer = getWallet(network);

  const paymentReceiver = await new PaymentReceiver__factory(signer).deploy(
    config.ccipBnMAddress,
    chowliveRoomAddress,
    config.routerAddress
  );
  await paymentReceiver.deployed();

  console.log(
    `PaymentReceiver deployed to ${paymentReceiver.address} on network ${SupportedNetworks[network]}`
  );

  const deployed = await loadDeployedAddresses();
  deployed.paymentReceiver = deployed.paymentReceiver || {};
  deployed.paymentReceiver[network] = paymentReceiver.address;
  await storeDeployedAddresses(deployed);

  return paymentReceiver;
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
  deployPaymentReceiver,
  deployPaymentRouter,
};
