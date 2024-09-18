// subnetSubscriptionTest.ts

import {
    SupportedNetworks,
    getDummyTokensFromNetwork,
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
  } from "./helpers/utils";
  import { deployChowliveRoom, deployPaymentReceiver } from "./helpers/deploy";
  import {
    ChowliveRoom,
    ChowlivePaymentReceiver as PaymentReceiver,
    Mock_Token__factory as ERC20__factory,
  } from "./ethers-contracts";
  
  import { ethers } from "ethers";
  
  async function setupEnvironment(targetNetwork: SupportedNetworks) {
    let chowliveRoom: ChowliveRoom, paymentReceiver: PaymentReceiver;
  
    if (!(await areRelationshipsVerified())) {
      console.log("Relationships not verified. Deploying new contracts...");
  
      // Deploy ChowliveRoom on Intersect L1 Testnet
      chowliveRoom = await deployChowliveRoom(intersectTestnet as any);
      // Deploy PaymentReceiver on Avalanche Fuji
      paymentReceiver = await deployPaymentReceiver(
        targetNetwork,
        chowliveRoom.address
      );
  
      // Set up relationships
      await chowliveRoom
        .setPaymentReceiverContract(paymentReceiver.address)
        .then(wait);
  
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
    }
  
    return { chowliveRoom, paymentReceiver };
  }
  
  async function testSubnetSubscription(
    targetNetwork: SupportedNetworks,
    chowliveRoom: ChowliveRoom,
    paymentReceiver: PaymentReceiver
  ) {
    console.log("Starting Subnet Subscription Test");
  
    const intersectWallet = getWallet(
      null,
      intersectTestnet.rpcUrls.default.http[0]
    );
    const receiver = getDummyTokensFromNetwork(targetNetwork);
  
    // Create a room on Intersect
    const roomCreationFee = ethers.utils.parseEther("1");
    const _subscriptionFee = ethers.utils.parseEther("0"); // Free subscription for subnet
    const createRoomTx = await chowliveRoom
      .connect(intersectWallet)
      .createRoom(false, _subscriptionFee, receiver.ccipBnM, {
        value: roomCreationFee,
        gasLimit: 3000000,
      });
    const createRoomReceipt = await createRoomTx.wait();
  
    const roomId = createRoomReceipt.events!.find(
      (e) => e.event === "RoomCreated"
    )!.args!.roomId;
  
    console.log(`Room created on Intersect with ID: ${roomId}`);
  
    const account = getAccount(targetNetwork);
    const { ccipBnM } = getDummyTokensFromNetwork(targetNetwork);
  
    // Get token contract and check balance
    const bnmToken = ERC20__factory.connect(ccipBnM, getWallet(targetNetwork));
    const bnmBalance = await bnmToken.balanceOf(account.address);
    console.log(
      "BnM Token balance on Fuji:",
      ethers.utils.formatEther(bnmBalance)
    );
  
    const roomDetails = await chowliveRoom
      .connect(intersectWallet)
      .getRoomDetails(roomId);
    const subscriptionFee = roomDetails.subscriptionFee;
  
    console.log(
      `Subscription fee for room ${roomId}:`,
      ethers.utils.formatEther(subscriptionFee)
    );
  
    // Approve tokens for the payment receiver
    await bnmToken.approve(paymentReceiver.address, subscriptionFee).then(wait);
  
    const guestListener = ethers.utils.getAddress(
      "0xf2750684eB187fF9f82e2F980f6233707eF5768C"
    );
  
    // Send subnet subscription payment
    const sendPaymentTx = await paymentReceiver.receivePayment(
      guestListener,
      roomId,
      subscriptionFee
    );
    const sendPaymentReceipt = await sendPaymentTx.wait();
  
    const paymentReceivedEvent = sendPaymentReceipt.events?.find(
      (e) => e.event === "PaymentReceived"
    );
  
    if (paymentReceivedEvent && paymentReceivedEvent.args) {
      const { user, roomId, amount } = paymentReceivedEvent.args;
      console.log("Subnet subscription payment received:");
      console.log("User:", user);
      console.log("Room ID:", roomId.toString());
      console.log("Amount:", ethers.utils.formatEther(amount));
    } else {
      console.log("PaymentReceived event not found or missing args");
    }
  
    await waitForFinality();
  
    // Verify subscription on Intersect
    const subscriptions = await chowliveRoom
      .connect(intersectWallet)
      .getUserSubscribedRooms(guestListener);
  
    console.log("Subscriptions found for user:", subscriptions);
  }
  
  async function main() {
    console.log("Starting Subnet Subscription Test for Chowlive");
  
    const targetNetwork = SupportedNetworks.AVALANCHE_FUJI;
  
    try {
      const { chowliveRoom, paymentReceiver } = await setupEnvironment(
        targetNetwork
      );
      await testSubnetSubscription(targetNetwork, chowliveRoom, paymentReceiver);
      console.log("Subnet subscription test completed successfully");
    } catch (error) {
      console.error("An error occurred during the subnet subscription test:");
      console.error(error);
    }
  }
  
  main().catch((error) => {
    console.error("Unhandled error in main function:");
    console.error(error);
    process.exit(1);
  });
  