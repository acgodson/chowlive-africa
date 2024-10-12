// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl, IAccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract ChowliveRoom is ERC721, AccessControl, CCIPReceiver {
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

  struct Room {
    uint256 id;
    uint256 subscriptionFee;
    address subscriptionToken;
    bool isPublic;
    uint256 tokenBalance;
    uint256 subscriberCount;
  }

  uint256 public roomCreationFee;
  uint256 public constant SUBSCRIPTION_PERIOD = 30 days;
  uint256 public lastRoomID;

  mapping(uint256 => Room) public rooms;
  mapping(address => uint256[]) private userSubscribedRooms;
  mapping(address => mapping(uint256 => uint256)) public userSubscriptions;

  event RoomCreated(uint256 indexed roomId, address indexed creator, bool isPublic);
  event SubscriptionUpdated(address indexed user, uint256 indexed roomId, uint256 expirationTimestamp);
  event SubscriptionCancelled(address indexed user, uint256 indexed roomId);
  event PaymentReceived(address user, uint256 roomId, uint256 amount);
  event CrossChainPaymentReceived(uint64 sourceChainSelector, address user, uint256 roomId, uint256 amount);
  event TokensWithdrawn(uint256 indexed roomId, address token, uint256 amount);
  event SubscriberCountChanged(uint256 indexed roomId, uint256 newCount);

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
  ) external payable returns (uint256) {
    require(msg.value >= roomCreationFee, "Insufficient ETH sent");

    if (isPublic) {
      require(subscriptionFee == 0, "Public rooms must have no subscription fee");
      require(subscriptionToken == address(0), "Public rooms must have no subscription token");
    }

    uint256 roomId = ++lastRoomID;
    _mint(msg.sender, roomId);

    rooms[roomId] = Room({
      id: roomId,
      subscriptionFee: subscriptionFee,
      subscriptionToken: subscriptionToken,
      isPublic: isPublic,
      tokenBalance: 0,
      subscriberCount: 1
    });

    bytes32 roomAdminRole = getRoomAdminRole(roomId);
    _grantRole(roomAdminRole, msg.sender);

    userSubscriptions[msg.sender][roomId] = type(uint256).max;
    userSubscribedRooms[msg.sender].push(roomId);

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

    require(receivedToken == rooms[roomId].subscriptionToken, "Incorrect token received");
    require(receivedAmount == rooms[roomId].subscriptionFee, "Incorrect subscription fee amount");

    rooms[roomId].tokenBalance += receivedAmount;

    emit CrossChainPaymentReceived(message.sourceChainSelector, user, roomId, receivedAmount);
    _updateSubscription(user, roomId);
  }

  function subscribeToRoom(address user, uint256 roomId) external {
    Room storage room = rooms[roomId];
    require(room.id != 0, "Room does not exist");

    if (!room.isPublic && room.subscriptionFee > 0) {
      IERC20 token = IERC20(room.subscriptionToken);
      require(token.transferFrom(msg.sender, address(this), room.subscriptionFee), "Payment transfer failed");
      room.tokenBalance += room.subscriptionFee;
      emit PaymentReceived(user, roomId, room.subscriptionFee);
    }

    _updateSubscription(user, roomId);
  }

  function _updateSubscription(address user, uint256 roomId) internal {
    uint256 currentExpiration = userSubscriptions[user][roomId];
    uint256 newExpiration = block.timestamp > currentExpiration
      ? block.timestamp + SUBSCRIPTION_PERIOD
      : currentExpiration + SUBSCRIPTION_PERIOD;
    userSubscriptions[user][roomId] = newExpiration;
    Room storage room = rooms[roomId];

    if (!_isRoomInUserSubscriptions(user, roomId)) {
      userSubscribedRooms[user].push(roomId);
      room.subscriberCount++;
    }

    emit SubscriptionUpdated(user, roomId, newExpiration);
    emit SubscriberCountChanged(roomId, room.subscriberCount);
  }

  function cancelSubscription(uint256 roomId) external {
    require(userSubscriptions[msg.sender][roomId] > 0, "No active subscription");

    userSubscriptions[msg.sender][roomId] = 0;

    Room storage room = rooms[roomId];
    if (room.subscriberCount > 0) {
      room.subscriberCount--;
    }

    for (uint i = 0; i < userSubscribedRooms[msg.sender].length; i++) {
      if (userSubscribedRooms[msg.sender][i] == roomId) {
        userSubscribedRooms[msg.sender][i] = userSubscribedRooms[msg.sender][
          userSubscribedRooms[msg.sender].length - 1
        ];
        userSubscribedRooms[msg.sender].pop();
        break;
      }
    }

    emit SubscriptionCancelled(msg.sender, roomId);
    emit SubscriberCountChanged(roomId, room.subscriberCount);
  }

  function hasAccess(address user, uint256 roomId) public view returns (bool) {
    if (rooms[roomId].isPublic) return true;
    return userSubscriptions[user][roomId] > block.timestamp;
  }

  function getUserSubscribedRooms(address user) public view returns (uint256[] memory) {
    return userSubscribedRooms[user];
  }

  function getUserActiveSubscriptions(address user) public view returns (uint256[] memory) {
    uint256[] memory subscribedRooms = userSubscribedRooms[user];
    uint256[] memory activeRooms = new uint256[](subscribedRooms.length);
    uint256 activeCount = 0;

    for (uint i = 0; i < subscribedRooms.length; i++) {
      if (hasAccess(user, subscribedRooms[i])) {
        activeRooms[activeCount] = subscribedRooms[i];
        activeCount++;
      }
    }

    assembly {
      mstore(activeRooms, activeCount)
    }

    return activeRooms;
  }

  function withdrawETH() external onlyRole(MANAGER_ROLE) {
    uint256 balance = address(this).balance;
    require(balance > 0, "No ETH to withdraw");
    payable(msg.sender).transfer(balance);
  }

  function withdrawRoomTokens(uint256 roomId) external {
    bytes32 roomAdminRole = getRoomAdminRole(roomId);
    require(hasRole(roomAdminRole, msg.sender), "Caller is not the room admin");

    Room storage room = rooms[roomId];
    require(room.id != 0, "Room does not exist");
    require(room.tokenBalance > 0, "No tokens to withdraw");

    IERC20 token = IERC20(room.subscriptionToken);
    uint256 amount = room.tokenBalance;
    room.tokenBalance = 0;

    require(token.transfer(msg.sender, amount), "Token transfer failed");
    emit TokensWithdrawn(roomId, room.subscriptionToken, amount);
  }

  function updateRoomCreationFee(uint256 newFee) external onlyRole(MANAGER_ROLE) {
    roomCreationFee = newFee;
  }

  function roomExists(uint256 roomId) public view returns (bool) {
    return rooms[roomId].id != 0;
  }

  function getRoomDetails(uint256 roomId) public view returns (Room memory) {
    require(roomExists(roomId), "Room does not exist");
    return rooms[roomId];
  }

  function getSubscriberCount(uint256 roomId) public view returns (uint256) {
    require(roomExists(roomId), "Room does not exist");
    return rooms[roomId].subscriberCount;
  }

  function _isRoomInUserSubscriptions(address user, uint256 roomId) internal view returns (bool) {
    for (uint i = 0; i < userSubscribedRooms[user].length; i++) {
      if (userSubscribedRooms[user][i] == roomId) {
        return true;
      }
    }
    return false;
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
