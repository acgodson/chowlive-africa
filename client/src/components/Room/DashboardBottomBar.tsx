import { useAtom } from 'jotai';
import Link from 'next/link';
import { FaSignOutAlt } from 'react-icons/fa';

// import useBackgroundColor from '../../hooks/useBackgroundColor';
import { roomAtom, ROOM_EMPTY } from '../../state/roomAtom';
import { cn } from '@/util/index';

const DashboardBottomBar = () => {
  // const { foregroundColor } = useBackgroundColor();
  const [room, setRoom] = useAtom(roomAtom);

  const handleLeaveRoom = () => setRoom(ROOM_EMPTY);

  return (
    <div>
      <div
        className={cn(
          'pt-4 pb-8 px-4 w-full absolute bottom-0',
          'hidden md:flex flex-col items-center justify-center',
          'bg-white dark:bg-gray-800'
        )}
        // style={{ backgroundColor: foregroundColor }}
      >
        {room.name ? (
          <>
            <div className='flex items-center justify-center'>
              <h2 className='w-[275px] text-lg font-bold mb-2 text-center truncate'>{room.name}</h2>
            </div>
            <div>
              <Link href='/dashboard'>
                <button
                  onClick={handleLeaveRoom}
                  className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  <FaSignOutAlt className='mr-2' />
                  Leave
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className='text-lg font-bold mb-2'>No room selected.</h2>
            <Link href='/dashboard'>
              <button className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                <FaSignOutAlt className='mr-2' />
                Back to Home
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardBottomBar;
