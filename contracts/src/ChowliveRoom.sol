// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

import "./libraries/RoomManager.sol";
import "./libraries/SubscriptionManager.sol";

import {AccessControl, IAccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ChowliveRoom is IChowliveRoom, ERC721, AccessControl, CCIPReceiver {
  using RoomManager for mapping(uint256 => Room);
  using SubscriptionManager for mapping(address => mapping(uint256 => uint256));

  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

  uint256 public roomCreationFee;
  uint256 public lastRoomID;

  mapping(uint256 => Room) public rooms;
  mapping(address => uint256[]) private userSubscribedRooms;
  mapping(address => mapping(uint256 => uint256)) public userSubscriptions;

  constructor(
    uint256 _roomCreationFee,
    address _ccipRouter
  ) ERC721("ChowliveRoom", "CHOW") CCIPReceiver(_ccipRouter) {
    roomCreationFee = _roomCreationFee;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MANAGER_ROLE, msg.sender);
  }

  function getRoomAdminRole(uint256 roomId) public pure returns (bytes32) {
    return keccak256(abi.encodePacked("ROOM_ADMIN_ROLE", roomId));
  }

  function createRoom(
    bool isPublic,
    uint256 subscriptionFee,
    address subscriptionToken
  ) external payable override returns (uint256) {
    require(msg.value >= roomCreationFee, "Insufficient ETH sent");

    uint256 roomId = rooms.createRoom(lastRoomID, isPublic, subscriptionFee, subscriptionToken);
    lastRoomID = roomId;
    _mint(msg.sender, roomId);

    bytes32 roomAdminRole = getRoomAdminRole(roomId);
    _grantRole(roomAdminRole, msg.sender);

    userSubscriptions.updateSubscription(userSubscribedRooms, msg.sender, roomId);

    emit RoomCreated(roomId, msg.sender, isPublic);

    if (msg.value > roomCreationFee) {
      payable(msg.sender).transfer(msg.value - roomCreationFee);
    }

    return roomId;
  }

  function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
    require(message.destTokenAmounts.length == 1, "Expected 1 token transfer");

    address receivedToken = message.destTokenAmounts[0].token;
    uint256 receivedAmount = message.destTokenAmounts[0].amount;

    (address user, uint256 roomId) = abi.decode(message.data, (address, uint256));

    Room storage room = rooms[roomId];
    require(receivedToken == room.subscriptionToken, "Incorrect token received");
    require(receivedAmount == room.subscriptionFee, "Incorrect subscription fee amount");

    RoomManager.addTokenBalance(room, receivedAmount);

    emit CrossChainPaymentReceived(message.sourceChainSelector, user, roomId, receivedAmount);
    _updateSubscription(user, roomId);
  }

  function subscribeToRoom(address user, uint256 roomId) external override {
    Room storage room = rooms[roomId];
    require(room.id != 0, "Room does not exist");

    if (!room.isPublic && room.subscriptionFee > 0) {
      IERC20 token = IERC20(room.subscriptionToken);
      require(token.transferFrom(msg.sender, address(this), room.subscriptionFee), "Payment transfer failed");
      RoomManager.addTokenBalance(room, room.subscriptionFee);
      emit PaymentReceived(user, roomId, room.subscriptionFee);
    }

    _updateSubscription(user, roomId);
  }

  function _updateSubscription(address user, uint256 roomId) internal {
    uint256 newExpiration = userSubscriptions.updateSubscription(userSubscribedRooms, user, roomId);
    RoomManager.incrementSubscriberCount(rooms[roomId]);

    emit SubscriptionUpdated(user, roomId, newExpiration);
    emit SubscriberCountChanged(roomId, rooms[roomId].subscriberCount);
  }

  function cancelSubscription(uint256 roomId) external override {
    userSubscriptions.cancelSubscription(userSubscribedRooms, msg.sender, roomId);
    RoomManager.decrementSubscriberCount(rooms[roomId]);

    emit SubscriptionCancelled(msg.sender, roomId);
    emit SubscriberCountChanged(roomId, rooms[roomId].subscriberCount);
  }

  function hasAccess(address user, uint256 roomId) public view override returns (bool) {
    if (rooms[roomId].isPublic) return true;
    return userSubscriptions[user][roomId] > block.timestamp;
  }

  function getUserSubscribedRooms(address user) public view override returns (uint256[] memory) {
    return userSubscribedRooms[user];
  }

  function getUserActiveSubscriptions(address user) public view override returns (uint256[] memory) {
    return SubscriptionManager.getActiveSubscriptions(userSubscribedRooms, userSubscriptions, user);
  }

  function withdrawETH() external override onlyRole(MANAGER_ROLE) {
    uint256 balance = address(this).balance;
    require(balance > 0, "No ETH to withdraw");
    payable(msg.sender).transfer(balance);
  }

  function withdrawRoomTokens(uint256 roomId) external override {
    bytes32 roomAdminRole = getRoomAdminRole(roomId);
    require(hasRole(roomAdminRole, msg.sender), "Caller is not the room admin");

    Room storage room = rooms[roomId];
    require(room.id != 0, "Room does not exist");
    require(room.tokenBalance > 0, "No tokens to withdraw");

    uint256 amount = RoomManager.withdrawTokens(room);

    IERC20 token = IERC20(room.subscriptionToken);
    require(token.transfer(msg.sender, amount), "Token transfer failed");
    emit TokensWithdrawn(roomId, room.subscriptionToken, amount);
  }

  function updateRoomCreationFee(uint256 newFee) external override onlyRole(MANAGER_ROLE) {
    roomCreationFee = newFee;
  }

  function roomExists(uint256 roomId) public view override returns (bool) {
    return rooms[roomId].id != 0;
  }

  function getRoomDetails(uint256 roomId) public view override returns (Room memory) {
    require(roomExists(roomId), "Room does not exist");
    return rooms[roomId];
  }

  function getSubscriberCount(uint256 roomId) public view override returns (uint256) {
    require(roomExists(roomId), "Room does not exist");
    return rooms[roomId].subscriberCount;
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public pure override(ERC721, AccessControl, CCIPReceiver) returns (bool) {
    return
      CCIPReceiver.supportsInterface(interfaceId) ||
      interfaceId == type(IERC721).interfaceId ||
      interfaceId == type(IAccessControl).interfaceId ||
      interfaceId == type(IERC165).interfaceId;
  }
}
