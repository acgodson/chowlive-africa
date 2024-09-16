import { Spinner } from '../atoms/';
import RoomCardDisplay from './RoomCardDisplay';
import RoomRollLayout from './RoomRollLayout';
import Room from '../../models/Room';

interface Props {
  rooms: Room[] | undefined;
  isLoading?: boolean;
}

const FavoritedRoomRoll = ({ rooms, isLoading }: Props) => {
  //@ts-ignore
  if (isLoading) return <Spinner size='lg' />;

  return (
    <RoomRollLayout>
      {rooms ? (
        rooms.map((room, index) => {
          return <RoomCardDisplay room={room} key={index} />;
        })
      ) : (
        <></>
      )}
    </RoomRollLayout>
  );
};

export default FavoritedRoomRoll;
