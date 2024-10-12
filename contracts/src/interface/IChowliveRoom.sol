// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IChowliveRoom {
  struct Room {
    uint256 id;
    uint256 subscriptionFee;
    address subscriptionToken;
    bool isPublic;
    uint256 tokenBalance;
    uint256 subscriberCount;
  }

  event RoomCreated(uint256 indexed roomId, address indexed creator, bool isPublic);
  event SubscriptionUpdated(address indexed user, uint256 indexed roomId, uint256 expirationTimestamp);
  event SubscriptionCancelled(address indexed user, uint256 indexed roomId);
  event PaymentReceived(address user, uint256 roomId, uint256 amount);
  event CrossChainPaymentReceived(uint64 sourceChainSelector, address user, uint256 roomId, uint256 amount);
  event TokensWithdrawn(uint256 indexed roomId, address token, uint256 amount);
  event SubscriberCountChanged(uint256 indexed roomId, uint256 newCount);

  function createRoom(bool isPublic, uint256 subFee, address subtoken) external payable returns (uint256);
  function subscribeToRoom(address user, uint256 roomId) external;
  function cancelSubscription(uint256 roomId) external;
  function hasAccess(address user, uint256 roomId) external view returns (bool);
  function getUserSubscribedRooms(address user) external view returns (uint256[] memory);
  function getUserActiveSubscriptions(address user) external view returns (uint256[] memory);
  function withdrawETH() external;
  function withdrawRoomTokens(uint256 roomId) external;
  function updateRoomCreationFee(uint256 newFee) external;
  function roomExists(uint256 roomId) external view returns (bool);
  function getRoomDetails(uint256 roomId) external view returns (Room memory);
  function getSubscriberCount(uint256 roomId) external view returns (uint256);
}
