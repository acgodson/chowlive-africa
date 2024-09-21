import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import RoomCardDisplay from './RoomCardDisplay';
import RoomRollLayout from './RoomRollLayout';
import Room from '../../models/Room';

interface Props {
  rooms: Room[];
  isLoading?: boolean;
  title?: string;
  end?: boolean;
}

const RoomRoll = ({ isLoading, rooms, title, end }: Props) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) return null;

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div
      className={`  mt-18 px-2 sm:px-16 w-full pb-12 min-h-fit ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-[#1a1c20] to-[#2c313c]'
          : 'bg-gradient-to-br from-[#F5F7FA] to-[#F9FAFB]'
      } ${end ? 'rounded-b-lg' : 'rounded-t-lg'}`}
    >
      {title && (
        <h2
          className={`
          text-3xl font-bold mt-16 mb-2 text-left w-full px-4 md:px-0
          ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'}
        `}
        >
          {title}
        </h2>
      )}
      <RoomRollLayout>
        {rooms.map((room, index) => (
          <RoomCardDisplay room={room} key={`${room.id}-${index}`} />
        ))}
      </RoomRollLayout>
    </div>
  );
};

export default RoomRoll;
