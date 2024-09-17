// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";

import "@teleporter/ITeleporterMessenger.sol";

contract ChowlivePaymentReceiver is CCIPReceiver, Ownable(msg.sender) {
  IERC20 public subscriptionToken;
  address public chowliveRoomContract;
  ITeleporterMessenger public teleporter;

  event PaymentReceived(address user, uint256 roomId, uint256 amount);
  event CrossChainPaymentReceived(uint64 sourceChainSelector, address user, uint256 roomId, uint256 amount);

  constructor(
    address _subscriptionToken,
    address _chowliveRoomContract,
    address _ccipRouter
  ) CCIPReceiver(_ccipRouter) {
    subscriptionToken = IERC20(_subscriptionToken);
    chowliveRoomContract = _chowliveRoomContract;
    teleporter = ITeleporterMessenger(address(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf));
  }

  function receivePayment(uint256 roomId, uint256 amount) external {
    require(subscriptionToken.transferFrom(msg.sender, address(this), amount), "Payment transfer failed");
    emit PaymentReceived(msg.sender, roomId, amount);
    _forwardSubscriptionUpdate(msg.sender, roomId, amount);
  }

  function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
    require(message.destTokenAmounts.length == 1, "Expected 1 token transfer");

    address receivedToken = message.destTokenAmounts[0].token;
    uint256 receivedAmount = message.destTokenAmounts[0].amount;

    require(receivedToken == address(subscriptionToken), "Incorrect token received");

    (address user, uint256 roomId) = abi.decode(message.data, (address, uint256));
    emit CrossChainPaymentReceived(message.sourceChainSelector, user, roomId, receivedAmount);
    _forwardSubscriptionUpdate(user, roomId, receivedAmount);
  }

  function _forwardSubscriptionUpdate(address user, uint256 roomId, uint256 amount) internal {
    bytes memory message = abi.encode(
      "updateSubscription(address,uint256,uint256,address)",
      user,
      roomId,
      amount,
      address(subscriptionToken)
    );
    teleporter.sendCrossChainMessage(
      TeleporterMessageInput({
        destinationBlockchainID: 0x1a5e1cba4b3ebcfc4b668d2642d152adcd4bb49aa556765720ca737f09468e6e, // Intersect L1 Testnet
        destinationAddress: chowliveRoomContract,
        feeInfo: TeleporterFeeInfo({feeTokenAddress: address(0), amount: 0}),
        requiredGasLimit: 100000,
        allowedRelayerAddresses: new address[](0),
        message: message
      })
    );
  }

  function withdrawTokens() external {
    uint256 balance = subscriptionToken.balanceOf(address(this));
    require(balance > 0, "No tokens to withdraw");
    require(subscriptionToken.transfer(owner(), balance), "Token transfer failed");
  }

  // Update contract addresses
  function updateAddresses(
    address _subscriptionToken,
    address _chowliveRoomContract,
    address _teleporterAddress
  ) external onlyOwner {
    subscriptionToken = IERC20(_subscriptionToken);
    chowliveRoomContract = _chowliveRoomContract;
    teleporter = ITeleporterMessenger(_teleporterAddress);
  }
}
