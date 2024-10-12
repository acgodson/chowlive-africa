// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interface/IChowliveRoom.sol";

library RoomManager {
  function createRoom(
    mapping(uint256 => IChowliveRoom.Room) storage rooms,
    uint256 lastRoomID,
    bool isPublic,
    uint256 subscriptionFee,
    address subscriptionToken
  ) internal returns (uint256) {
    require(
      !isPublic || (subscriptionFee == 0 && subscriptionToken == address(0)),
      "Invalid public room settings"
    );

    uint256 roomId = ++lastRoomID;

    rooms[roomId] = IChowliveRoom.Room({
      id: roomId,
      subscriptionFee: subscriptionFee,
      subscriptionToken: subscriptionToken,
      isPublic: isPublic,
      tokenBalance: 0,
      subscriberCount: 1
    });

    return roomId;
  }

  function incrementSubscriberCount(IChowliveRoom.Room storage room) internal {
    room.subscriberCount++;
  }

  function decrementSubscriberCount(IChowliveRoom.Room storage room) internal {
    if (room.subscriberCount > 0) {
      room.subscriberCount--;
    }
  }

  function addTokenBalance(IChowliveRoom.Room storage room, uint256 amount) internal {
    room.tokenBalance += amount;
  }

  function withdrawTokens(IChowliveRoom.Room storage room) internal returns (uint256) {
    uint256 amount = room.tokenBalance;
    room.tokenBalance = 0;
    return amount;
  }
}
