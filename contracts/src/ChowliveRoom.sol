// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChowliveRoom is ERC721, Ownable(msg.sender) {
  struct Room {
    uint256 id;
    uint256 subscriptionFee;
    address subscriptionToken;
    bool isPublic;
  }

  uint256 public roomCreationFee;
  uint256 public constant SUBSCRIPTION_PERIOD = 30 days;
  uint256 public nextRoomId;
  address public paymentReceiverContract;

  mapping(uint256 => Room) public rooms;
  mapping(address => uint256[]) private userSubscribedRooms;
  mapping(address => mapping(uint256 => uint256)) public userSubscriptions;

  event RoomCreated(uint256 indexed roomId, address indexed creator, bool isPublic);
  event SubscriptionUpdated(address indexed user, uint256 indexed roomId, uint256 expirationTimestamp);
  event SubscriptionCancelled(address indexed user, uint256 indexed roomId);

  constructor(uint256 _roomCreationFee) ERC721("ChowliveRoom", "CHOW") {
    roomCreationFee = _roomCreationFee;
  }

  function setPaymentReceiverContract(address _paymentReceiverContract) external onlyOwner {
    paymentReceiverContract = _paymentReceiverContract;
  }

  function createRoom(bool isPublic, uint256 subscriptionFee, address subscriptionToken) external payable {
    require(msg.value >= roomCreationFee, "Insufficient PEARL sent");

    if (isPublic) {
      require(subscriptionFee == 0, "Public rooms must have no subscription fee");
      require(subscriptionToken == address(0), "Public rooms must have no subscription token");
    } else {
      require(subscriptionFee > 0, "Private rooms must have a subscription fee");
      require(subscriptionToken != address(0), "Private rooms must have a valid subscription token");
    }

    uint256 roomId = nextRoomId++;
    _mint(msg.sender, roomId);

    rooms[roomId] = Room({
      id: roomId,
      subscriptionFee: subscriptionFee,
      subscriptionToken: subscriptionToken,
      isPublic: isPublic
    });

    // Set creator's subscription to forever
    userSubscriptions[msg.sender][roomId] = type(uint256).max;
    userSubscribedRooms[msg.sender].push(roomId);

    emit RoomCreated(roomId, msg.sender, isPublic);

    if (msg.value > roomCreationFee) {
      payable(msg.sender).transfer(msg.value - roomCreationFee);
    }
  }

  function updateSubscription(
    address user,
    uint256 roomId,
    uint256 amountReceived,
    address tokenReceived
  ) external {
    // TODO: might change this to the ccip router address
    require(msg.sender == paymentReceiverContract, "Only payment receiver can update subscriptions");

    Room memory room = rooms[roomId];
    require(amountReceived == room.subscriptionFee, "Incorrect subscription fee amount");
    require(tokenReceived == room.subscriptionToken, "Incorrect subscription token");

    uint256 currentExpiration = userSubscriptions[user][roomId];
    uint256 newExpiration = block.timestamp > currentExpiration
      ? block.timestamp + SUBSCRIPTION_PERIOD
      : currentExpiration + SUBSCRIPTION_PERIOD;
    userSubscriptions[user][roomId] = newExpiration;

    if (!_isRoomInUserSubscriptions(user, roomId)) {
      userSubscribedRooms[user].push(roomId);
    }

    emit SubscriptionUpdated(user, roomId, newExpiration);
  }

  function cancelSubscription(uint256 roomId) external {
    require(userSubscriptions[msg.sender][roomId] > 0, "No active subscription");

    userSubscriptions[msg.sender][roomId] = 0;

    // Remove room from user's subscribed rooms
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

    // Resize the array to fit only active subscriptions
    assembly {
      mstore(activeRooms, activeCount)
    }

    return activeRooms;
  }

  // Revenue Collection for ChowLive Platform Ownership
  function withdrawPEARL() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No PEARL to withdraw");
    payable(owner()).transfer(balance);
  }

  function updateRoomCreationFee(uint256 newFee) external onlyOwner {
    roomCreationFee = newFee;
  }

  function roomExists(uint256 roomId) public view returns (bool) {
    return rooms[roomId].id != 0;
  }

  function getRoomDetails(uint256 roomId) public view returns (Room memory) {
    require(roomExists(roomId), "Room does not exist");
    return rooms[roomId];
  }

  function _isRoomInUserSubscriptions(address user, uint256 roomId) internal view returns (bool) {
    for (uint i = 0; i < userSubscribedRooms[user].length; i++) {
      if (userSubscribedRooms[user][i] == roomId) {
        return true;
      }
    }
    return false;
  }
}
