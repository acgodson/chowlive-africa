import React from 'react';

interface Props {
  children: React.ReactNode;
}

const RoomRollLayout = ({ children }: Props) => {
  return (
    <div className='w-full'>
      <div className='mt-4 md:mt-8 px-4 md:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 items-stretch justify-stretch'>
        {children}
      </div>
    </div>
  );
};

export default RoomRollLayout;
