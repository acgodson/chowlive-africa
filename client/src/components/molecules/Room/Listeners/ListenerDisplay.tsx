import React from 'react';
import User from '@/utils/models/User';
import StyledAvatar from '@/components/molecules/StyledAvatar';

interface Props {
  user: User;
}

const ListenersDisplay = ({ user }: Props) => {
  return (
    <div className='flex flex-row justify-center items-center'>
      <StyledAvatar name={user.name} src={user.imageSrc ?? ''} />
      <p className={'ml-2'}>{user.name}</p>
    </div>
  );
};

export default ListenersDisplay;
