// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract ChowlivePaymentRouter {
  using SafeERC20 for IERC20;

  uint256 constant GAS_LIMIT = 250_000;

  address public paymentReceiverContract;
  IERC20 public subscriptionToken;
  uint64 public destinationChainSelector;
  IRouterClient public immutable router;
  LinkTokenInterface public immutable linkToken;

  enum PayFeesIn {
    Native,
    LINK
  }

  event PaymentSent(address indexed sender, uint256 roomId, uint256 amount, bytes32 messageId);

  constructor(
    address _router,
    address _linkToken,
    address _paymentReceiverContract,
    address _subscriptionToken,
    uint64 _destinationChainSelector
  ) {
    router = IRouterClient(_router);
    linkToken = LinkTokenInterface(_linkToken);
    paymentReceiverContract = _paymentReceiverContract;
    subscriptionToken = IERC20(_subscriptionToken);
    destinationChainSelector = _destinationChainSelector;
  }

  function subscribeToCrossChainRoom(
    address user,
    uint256 roomId,
    uint256 amount,
    PayFeesIn payFeesIn
  ) external payable returns (bytes32 messageId) {
    require(subscriptionToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
    tokenAmounts[0] = Client.EVMTokenAmount({token: address(subscriptionToken), amount: amount});

    bytes memory payload = abi.encode(user, roomId);

    Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
      receiver: abi.encode(paymentReceiverContract),
      data: payload,
      tokenAmounts: tokenAmounts,
      extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: GAS_LIMIT})),
      feeToken: payFeesIn == PayFeesIn.LINK ? address(linkToken) : address(0)
    });

    uint256 fees = router.getFee(destinationChainSelector, message);

    subscriptionToken.safeApprove(address(router), amount);

    if (payFeesIn == PayFeesIn.LINK) {
      require(linkToken.transferFrom(msg.sender, address(this), fees), "LINK transfer failed");
      linkToken.approve(address(router), fees);
      messageId = router.ccipSend(destinationChainSelector, message);
    } else {
      require(msg.value >= fees, "Insufficient native token for fees");
      messageId = router.ccipSend{value: fees}(destinationChainSelector, message);
      // Refund excess fees
      if (msg.value > fees) {
        payable(msg.sender).transfer(msg.value - fees);
      }
    }

    emit PaymentSent(user, roomId, amount, messageId);
    return messageId;
  }

  function quoteCrossChainMessage(
    uint64 targetChain,
    PayFeesIn payFeesIn,
    uint256 tokenAmount
  ) public view returns (uint256 cost) {
    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
    tokenAmounts[0] = Client.EVMTokenAmount({token: address(subscriptionToken), amount: tokenAmount});

    Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
      receiver: abi.encode(paymentReceiverContract),
      data: new bytes(0), // We don't need actual data for fee estimation
      tokenAmounts: tokenAmounts,
      extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: GAS_LIMIT})),
      feeToken: payFeesIn == PayFeesIn.LINK ? address(linkToken) : address(0)
    });

    cost = router.getFee(targetChain, message);
  }

  function updateAddresses(
    address _paymentReceiverContract,
    address _subscriptionToken,
    uint64 _destinationChainSelector
  ) external {
    paymentReceiverContract = _paymentReceiverContract;
    subscriptionToken = IERC20(_subscriptionToken);
    destinationChainSelector = _destinationChainSelector;
  }

  function withdrawTokens(address token, address to) external {
    uint256 balance = IERC20(token).balanceOf(address(this));
    require(balance > 0, "No tokens to withdraw");
    IERC20(token).safeTransfer(to, balance);
  }

  receive() external payable {}
}
