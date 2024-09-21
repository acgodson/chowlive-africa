import React from 'react';

const MarqueeAnnouncement = ({ rooms }: any) => {
  return (
    <div className='w-full bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white overflow-hidden fixed bottom-0 left-0 py-2 bg-opacity-90 backdrop-blur-sm'>
      <div className='flex'>
        <div className='animate-marquee whitespace-nowrap flex items-center'>
          {rooms.concat(rooms).map((room: any, index: number) => (
            <span key={index} className='mx-4 flex items-center'>
              <span className='w-2 h-2 bg-green-400 rounded-full mr-2'></span>
              <span className='font-semibold'>{room.name}</span>
              <span className='mx-1 text-gray-400'>|</span>
              <span className='text-yellow-300'>NFT ID {room.nftId}</span>
              <span className='mx-1 text-gray-400'>|</span>
              <span className='text-blue-300'>{room.chow} CHOW</span>
            </span>
          ))}
        </div>
        <div className='absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent'></div>
      </div>
    </div>
  );
};

export default MarqueeAnnouncement;
