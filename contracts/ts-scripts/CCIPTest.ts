// subnetSubscriptionTest.ts

import {
  SupportedNetworks,
  getDummyTokensFromNetwork,
  getNetworkConfig,
  intersectTestnet,
} from "./helpers/config";
import {
  getWallet,
  getChowliveRoom,
  getPaymentReceiver,
  wait,
  areRelationshipsVerified,
  setRelationshipsVerified,
  getAccount,
  waitForFinality,
  requestTokensFromFaucet,
  getPaymentRouter,
} from "./helpers/utils";
import {
  deployChowliveRoom,
  deployPaymentReceiver,
  deployPaymentRouter,
} from "./helpers/deploy";
import {
  ChowliveRoom,
  ChowlivePaymentReceiver as PaymentReceiver,
  ChowlivePaymentRouter as PaymentRouter,
  Mock_Token__factory as ERC20__factory,
} from "./ethers-contracts";

import { ethers } from "ethers";

async function setupEnvironment(
  sourceNetwork: SupportedNetworks,
  targetNetwork: SupportedNetworks
) {
  let chowliveRoom: ChowliveRoom,
    paymentReceiver: PaymentReceiver,
    paymentRouter: PaymentRouter;

  if (!(await areRelationshipsVerified())) {
    console.log("Relationships not verified. Deploying new contracts...");

    // Deploy ChowliveRoom on Intersect L1 Testnet
    chowliveRoom = await deployChowliveRoom(intersectTestnet);
    // Deploy PaymentReceiver on Avalanche Fuji
    paymentReceiver = await deployPaymentReceiver(
      targetNetwork,
      chowliveRoom.address
    );

    // Deploy PaymentRouter on Ethereum Sepolia
    paymentRouter = await deployPaymentRouter(
      sourceNetwork,
      paymentReceiver.address,
      targetNetwork
    );

    // Set up relationships
    await chowliveRoom
      .setPaymentReceiverContract(paymentReceiver.address)
      .then(wait);

    // await paymentReceiver.updateAddresses(chowliveRoom.address).then(wait);

    // Verify relationships
    console.log("Verifying relationships...");
    const paymentReceiverAddress = await chowliveRoom.paymentReceiverContract();
    console.assert(
      paymentReceiverAddress === paymentReceiver.address,
      "Payment receiver address mismatch"
    );

    await setRelationshipsVerified(true);
    console.log("Setup completed. Relationships verified.");
  } else {
    console.log("Relationships already verified. Skipping deployment.");
    chowliveRoom = await getChowliveRoom(intersectTestnet);
    paymentReceiver = await getPaymentReceiver(targetNetwork);
    paymentRouter = await getPaymentRouter(sourceNetwork);
  }

  return { chowliveRoom, paymentReceiver, paymentRouter };
}

async function testCCIPSubscription(
  sourceNetwork: SupportedNetworks,
  targetNetwork: SupportedNetworks,
  chowliveRoom: ChowliveRoom,
  paymentReceiver: PaymentReceiver,
  paymentRouter: PaymentRouter
) {
  console.log("Starting Cross-Chain Subscription Test");

  const account = getAccount(sourceNetwork);
  const intersectWallet = getWallet(
    null,
    intersectTestnet.rpcUrls.default.http[0]
  );

  // Create a room on Intersect
  const roomCreationFee = ethers.utils.parseEther("1");
  const subscriptionFee = ethers.utils.parseEther("1");
  const { ccipBnM } = getDummyTokensFromNetwork(sourceNetwork);
  const receiver = getDummyTokensFromNetwork(targetNetwork);
  const createRoomTx = await chowliveRoom
    .connect(intersectWallet)
    .createRoom(false, subscriptionFee, receiver.ccipBnM, {
      value: roomCreationFee,
      gasLimit: 3000000,
    });
  const createRoomReceipt = await createRoomTx.wait();

  const roomId = createRoomReceipt.events!.find(
    (e) => e.event === "RoomCreated"
  )!.args!.roomId;

  console.log(`Room created on Intersect with ID: ${roomId}`);

  // Request CCIP tokens from faucet on Sepolia
  const targetAmount = ethers.utils.parseEther("2");
  await requestTokensFromFaucet(sourceNetwork, targetAmount as any);

  // Get token contract and check balance
  const bnmToken = ERC20__factory.connect(ccipBnM, getWallet(sourceNetwork));
  const bnmBalance = await bnmToken.balanceOf(account.address);
  console.log("BnM Token balance:", ethers.utils.formatEther(bnmBalance));

  // Approve tokens for the router
  await bnmToken.approve(paymentRouter.address, subscriptionFee).then(wait);

  // Get message cost and send cross-chain payment
  const targetConfig = getNetworkConfig(targetNetwork);
  const messageCost = await paymentRouter.quoteCrossChainMessage(
    targetConfig.chainSelector,
    0,
    subscriptionFee
  );
  console.log("Message cost:", ethers.utils.formatEther(messageCost));

  const messageCostWithBuffer =
    (BigInt(messageCost.toString()) * BigInt(110)) / BigInt(100);

  const guestListener = ethers.utils.getAddress(
    "0xf2750684eB187fF9f82e2F980f6233707eF5768C"
  );

  const sendPaymentTx = await paymentRouter.sendPayment(
    guestListener,
    roomId,
    subscriptionFee,
    0,
    {
      value: messageCostWithBuffer,
      gasLimit: 500000,
    }
  );
  const sendPaymentReceipt = await sendPaymentTx.wait();

  const paymentSentEvent = sendPaymentReceipt.events?.find(
    (e) => e.event === "PaymentSent"
  );

  if (paymentSentEvent && paymentSentEvent.args) {
    const messageId = paymentSentEvent.args.messageId;
    console.log("Message ID:", messageId);
    const ccipExplorerUrl = `https://ccip.chain.link/msg/${messageId}`;
    console.log("Cross-chain subscription payment sent successfully");
    console.log("CCIP Explorer URL:", ccipExplorerUrl);
  } else {
    console.log("PaymentSent event not found or missing args");
  }

  await waitForFinality();

  // Verify subscription on Intersect
  const subscriptions = await chowliveRoom
    .connect(intersectWallet)
    .getUserSubscribedRooms(guestListener);

  console.log("Subscriptions found for user:", subscriptions);
}

async function main() {
  console.log("Starting Cross-Chain Subscription Test for Chowlive");

  const sourceNetwork = SupportedNetworks.ETHEREUM_SEPOLIA;
  const targetNetwork = SupportedNetworks.AVALANCHE_FUJI;

  try {
    const { chowliveRoom, paymentReceiver, paymentRouter } =
      await setupEnvironment(sourceNetwork, targetNetwork);

    await testCCIPSubscription(
      sourceNetwork,
      targetNetwork,
      chowliveRoom,
      paymentReceiver,
      paymentRouter
    );
    console.log("Cross-chain subscription test completed successfully");
  } catch (error) {
    console.error(
      "An error occurred during the cross-chain subscription test:"
    );
    console.error(error);
  }
}

main().catch((error) => {
  console.error("Unhandled error in main function:");
  console.error(error);
  process.exit(1);
});
