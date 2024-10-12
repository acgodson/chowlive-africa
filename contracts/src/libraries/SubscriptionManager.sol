// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library SubscriptionManager {
  uint256 public constant SUBSCRIPTION_PERIOD = 30 days;

  function updateSubscription(
    mapping(address => mapping(uint256 => uint256)) storage userSubscriptions,
    mapping(address => uint256[]) storage userSubscribedRooms,
    address user,
    uint256 roomId
  ) internal returns (uint256) {
    uint256 currentExpiration = userSubscriptions[user][roomId];
    uint256 newExpiration = block.timestamp > currentExpiration
      ? block.timestamp + SUBSCRIPTION_PERIOD
      : currentExpiration + SUBSCRIPTION_PERIOD;
    userSubscriptions[user][roomId] = newExpiration;

    if (!isRoomInUserSubscriptions(userSubscribedRooms, user, roomId)) {
      userSubscribedRooms[user].push(roomId);
    }

    return newExpiration;
  }

  function cancelSubscription(
    mapping(address => mapping(uint256 => uint256)) storage userSubscriptions,
    mapping(address => uint256[]) storage userSubscribedRooms,
    address user,
    uint256 roomId
  ) internal {
    require(userSubscriptions[user][roomId] > 0, "No active subscription");

    userSubscriptions[user][roomId] = 0;

    for (uint i = 0; i < userSubscribedRooms[user].length; i++) {
      if (userSubscribedRooms[user][i] == roomId) {
        userSubscribedRooms[user][i] = userSubscribedRooms[user][userSubscribedRooms[user].length - 1];
        userSubscribedRooms[user].pop();
        break;
      }
    }
  }

  function isRoomInUserSubscriptions(
    mapping(address => uint256[]) storage userSubscribedRooms,
    address user,
    uint256 roomId
  ) internal view returns (bool) {
    for (uint i = 0; i < userSubscribedRooms[user].length; i++) {
      if (userSubscribedRooms[user][i] == roomId) {
        return true;
      }
    }
    return false;
  }

  function getActiveSubscriptions(
    mapping(address => uint256[]) storage userSubscribedRooms,
    mapping(address => mapping(uint256 => uint256)) storage userSubscriptions,
    address user
  ) internal view returns (uint256[] memory) {
    uint256[] memory subscribedRooms = userSubscribedRooms[user];
    uint256[] memory activeRooms = new uint256[](subscribedRooms.length);
    uint256 activeCount = 0;

    for (uint i = 0; i < subscribedRooms.length; i++) {
      if (userSubscriptions[user][subscribedRooms[i]] > block.timestamp) {
        activeRooms[activeCount] = subscribedRooms[i];
        activeCount++;
      }
    }

    assembly {
      mstore(activeRooms, activeCount)
    }

    return activeRooms;
  }
}
