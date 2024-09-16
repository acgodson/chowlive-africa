import React from 'react';
import User from '../../../models/User';
import StyledAvatar from 'src/components/molecules/StyledAvatar';

interface Props {
  user: User;
}

const ListenersDisplay = ({ user }: Props) => {
  return (
    <div className='flex flex-row justify-center items-center'>
      <StyledAvatar 
       name={user.name} src={user.imageSrc ?? ""} />
      <p className={'ml-2'}>{user.name}</p>
    </div>
  );
};

export default ListenersDisplay;
