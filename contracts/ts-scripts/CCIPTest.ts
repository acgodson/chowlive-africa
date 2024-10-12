import {
  SupportedNetworks,
  getDummyTokensFromNetwork,
  getNetworkConfig,
} from "./helpers/config";
import { baseSepolia } from "viem/chains";
import {
  getWallet,
  getChowliveRoom,
  wait,
  getAccount,
  requestTokensFromFaucet,
  loadDeployedAddresses,
} from "./helpers/utils";
import { deployPaymentRouter } from "./helpers/deploy";
import {
  ChowliveRoom,
  ChowlivePaymentRouter as PaymentRouter,
  Mock_Token__factory as ERC20__factory,
} from "./ethers-contracts";
import { ethers } from "ethers";
import { bold, green, yellow, blue, red, cyan, magenta } from "colorette";

async function setupEnvironment(
  sourceNetwork: SupportedNetworks,
  targetNetwork: SupportedNetworks
) {
  console.log(bold(cyan("\n📦 Setting up environment...")));

  const deployedAddresses = await loadDeployedAddresses();
  const chowliveRoomAddress = deployedAddresses.chowliveRoom[baseSepolia.id];

  if (!chowliveRoomAddress) {
    throw new Error(
      red(
        "❌ ChowliveRoom address not found. Please run 'npm run base-test' first."
      )
    );
  }

  console.log(
    green(
      `✅ Using existing ChowliveRoom address: ${bold(chowliveRoomAddress)}`
    )
  );
  const chowliveRoom = await getChowliveRoom(baseSepolia as any);

  console.log(blue("\n🚀 Deploying new PaymentRouter..."));
  const paymentRouter = await deployPaymentRouter(
    sourceNetwork,
    chowliveRoomAddress,
    targetNetwork
  );

  console.log(
    green(`✅ PaymentRouter deployed at: ${bold(paymentRouter.address)}`)
  );

  return { chowliveRoom, paymentRouter };
}

async function testCCIPSubscription(
  sourceNetwork: SupportedNetworks,
  targetNetwork: SupportedNetworks,
  chowliveRoom: ChowliveRoom,
  paymentRouter: PaymentRouter
) {
  console.log(bold(cyan("\n🔗 Starting Cross-Chain Subscription Test")));

  const account = getAccount();
  const baseSepoliaWallet = getWallet(
    null,
    baseSepolia.rpcUrls.default.http[0]
  );
  const sepoliaWallet = getWallet(sourceNetwork);

  const { ccipBnM: sourceBnM } = getDummyTokensFromNetwork(sourceNetwork);
  const { ccipBnM: targetBnM } = getDummyTokensFromNetwork(targetNetwork);

  console.log(blue("\n📊 Token Addresses:"));
  console.log(`   Source (Sepolia) BnM: ${sourceBnM}`);
  console.log(`   Target (Base Sepolia) BnM: ${targetBnM}`);

  const roomCreationFee = ethers.utils.parseEther("0.0001");
  const subscriptionFee = ethers.utils.parseEther("0.001");

  console.log(blue("\n🏗️ Creating a room on Base Sepolia..."));
  const createRoomTx = await chowliveRoom
    .connect(baseSepoliaWallet)
    .createRoom(false, subscriptionFee, targetBnM, {
      value: roomCreationFee,
      gasLimit: 3000000,
    });
  const createRoomReceipt = await createRoomTx.wait();
  const roomId = createRoomReceipt.events!.find(
    (e) => e.event === "RoomCreated"
  )!.args!.roomId;
  console.log(green(`✅ Room created with ID: ${bold(roomId)}`));

  console.log(blue("\n💧 Requesting tokens from faucet..."));
  await requestTokensFromFaucet(sourceNetwork);
  const bnmToken = ERC20__factory.connect(sourceBnM, sepoliaWallet);
  const bnmBalance = await bnmToken.balanceOf(account.address);
  console.log(
    green(
      `✅ BnM Token balance on Sepolia: ${bold(
        ethers.utils.formatEther(bnmBalance)
      )}`
    )
  );

  console.log(blue("\n👍 Approving tokens for the router on Sepolia..."));
  await bnmToken
    .connect(sepoliaWallet)
    .approve(paymentRouter.address, subscriptionFee)
    .then(wait);
  console.log(green("✅ Token approval successful"));

  console.log(blue("\n💰 Calculating message cost..."));
  const targetConfig = getNetworkConfig(targetNetwork);
  const messageCost = await paymentRouter.quoteCrossChainMessage(
    targetConfig.chainSelector,
    0,
    subscriptionFee
  );
  console.log(
    green(`✅ Message cost: ${bold(ethers.utils.formatEther(messageCost))} ETH`)
  );

  const messageCostWithBuffer =
    (BigInt(messageCost.toString()) * BigInt(110)) / BigInt(100);
  const guestListener = ethers.utils.getAddress(
    "0xf2750684eB187fF9f82e2F980f6233707eF5768C"
  );

  console.log(blue("\n🚀 Initiating cross-chain subscription..."));
  const sendPaymentTx = await paymentRouter
    .connect(sepoliaWallet)
    .subscribeToCrossChainRoom(guestListener, roomId, subscriptionFee, 0, {
      value: messageCostWithBuffer,
      gasLimit: 500000,
    });
  const sendPaymentReceipt = await sendPaymentTx.wait();

  const paymentSentEvent = sendPaymentReceipt.events?.find(
    (e) => e.event === "PaymentSent"
  );
  if (paymentSentEvent && paymentSentEvent.args) {
    const messageId = paymentSentEvent.args.messageId;
    console.log(
      green("\n✅ Cross-chain subscription payment sent successfully")
    );
    console.log(yellow(`ℹ️ Message ID: ${messageId}`));
    const ccipExplorerUrl = `https://ccip.chain.link/msg/${messageId}`;
    console.log(magenta(bold("\n🔗 CCIP Explorer URL:")));
    console.log(magenta(bold(ccipExplorerUrl)));
    console.log(
      yellow(
        "\nPlease check the CCIP Explorer URL to confirm the transaction status."
      )
    );
  } else {
    console.log(red("❌ PaymentSent event not found or missing args"));
  }
}

async function main() {
  console.log(
    bold(cyan("🚀 Starting Cross-Chain Subscription Test for Chowlive"))
  );

  const sourceNetwork = SupportedNetworks.ETHEREUM_SEPOLIA;
  const targetNetwork = SupportedNetworks.BASE_SEPOLIA;

  try {
    const { chowliveRoom, paymentRouter } = await setupEnvironment(
      sourceNetwork,
      targetNetwork
    );
    await testCCIPSubscription(
      sourceNetwork,
      targetNetwork,
      chowliveRoom,
      paymentRouter
    );
    console.log(
      bold(green("\n✅ Cross-chain subscription test completed successfully"))
    );
    console.log(
      yellow("Please check the CCIP Explorer URL above for final confirmation.")
    );
  } catch (error) {
    console.error(
      red("\n❌ An error occurred during the cross-chain subscription test:")
    );
    console.error(error);
  }
}

main().catch((error) => {
  console.error(red("\n❌ Unhandled error in main function:"));
  console.error(error);
  process.exit(1);
});
