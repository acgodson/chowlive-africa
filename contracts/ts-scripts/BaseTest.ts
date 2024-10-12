import { SupportedNetworks, getDummyTokensFromNetwork } from "./helpers/config";
import { baseSepolia } from "viem/chains";
import {
  getWallet,
  getChowliveRoom,
  areRelationshipsVerified,
  setRelationshipsVerified,
  waitForFinality,
} from "./helpers/utils";
import { deployChowliveRoom } from "./helpers/deploy";
import { ChowliveRoom } from "./ethers-contracts";
import { ethers } from "ethers";
import { bold, green, yellow, blue, red, cyan } from 'colorette';

async function setupEnvironment() {
  let chowliveRoom: ChowliveRoom;

  if (!(await areRelationshipsVerified())) {
    console.log(yellow("Relationships not verified. Deploying new contract..."));
    chowliveRoom = await deployChowliveRoom(baseSepolia as any);
    await setRelationshipsVerified(true);
    console.log(green("Setup completed. Relationship verified."));
  } else {
    console.log(blue("Relationship already verified. Skipping deployment."));
    chowliveRoom = await getChowliveRoom(baseSepolia);
  }

  return { chowliveRoom };
}

async function testSameChainSubscription(chowliveRoom: ChowliveRoom) {
  console.log(bold(cyan("\n📋 Starting Same-chain Subscription Test on Base Sepolia")));

  const wallet = getWallet(null, baseSepolia.rpcUrls.default.http[0]);
  const { ccipBnM } = getDummyTokensFromNetwork(SupportedNetworks.BASE_SEPOLIA);

  console.log(yellow("\nℹ️ Note: Setting subscription fee to zero for testing on Base Sepolia."));
  console.log(yellow("   In a real-world scenario, you would need to bridge CCIP-BnM tokens to Base Sepolia for paid subscriptions."));

  // Create a room
  const roomCreationFee = ethers.utils.parseEther("0.0001");
  const subscriptionFee = ethers.utils.parseEther("0");
  console.log(blue("\n🏗️ Creating a room..."));
  const createRoomTx = await chowliveRoom
    .connect(wallet)
    .createRoom(false, subscriptionFee, ccipBnM, {
      value: roomCreationFee,
      gasLimit: 3000000,
    });
  const createRoomReceipt = await createRoomTx.wait();

  const roomId = createRoomReceipt.events!.find(
    (e) => e.event === "RoomCreated"
  )!.args!.roomId;

  console.log(green(`✅ Room created on Base Sepolia with ID: ${bold(roomId)}`));

  // Subscribe to the room
  const guestAddress = "0xf2750684eB187fF9f82e2F980f6233707eF5768C";
  console.log(blue(`\n🔔 Subscribing guest (${guestAddress}) to room...`));
  const subscribeTx = await chowliveRoom.subscribeToRoom(guestAddress, roomId, {
    gasLimit: 3000000,
  });
  const subscribeReceipt = await subscribeTx.wait();

  const subscriptionUpdatedEvent = subscribeReceipt.events?.find(
    (e) => e.event === "SubscriptionUpdated"
  );

  if (subscriptionUpdatedEvent && subscriptionUpdatedEvent.args) {
    const { user, roomId, expirationTimestamp } = subscriptionUpdatedEvent.args;
    console.log(green("✅ Subscription updated:"));
    console.log(`   User: ${user}`);
    console.log(`   Room ID: ${roomId.toString()}`);
    console.log(`   Expiration Timestamp: ${expirationTimestamp.toString()}`);
  } else {
    console.log(red("❌ SubscriptionUpdated event not found or missing args"));
  }

  await waitForFinality();

  // Verify subscription
  console.log(blue("\n🔍 Verifying subscription..."));
  const subscriptions = await chowliveRoom
    .connect(wallet)
    .getUserSubscribedRooms(guestAddress);

  console.log(green("✅ Subscriptions found for user:"), subscriptions);

  // Check access
  console.log(blue("\n🔐 Checking user access to room..."));
  const hasAccess = await chowliveRoom.hasAccess(guestAddress, roomId);
  console.log(green(`✅ User has access to room: ${hasAccess ? 'Yes' : 'No'}`));
}

async function main() {
  console.log(bold(cyan("🚀 Starting Same-chain Subscription Test for Chowlive on Base Sepolia")));

  try {
    const { chowliveRoom } = await setupEnvironment();
    await testSameChainSubscription(chowliveRoom);
    console.log(bold(green("\n✅ Same-chain subscription test completed successfully")));
  } catch (error) {
    console.error(red("\n❌ An error occurred during the same-chain subscription test:"));
    console.error(error);
    setRelationshipsVerified(false);
  }
}

main().catch((error) => {
  console.error(red("\n❌ Unhandled error in main function:"));
  console.error(error);
  process.exit(1);
});