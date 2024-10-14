import React from 'react';
import { Avatar as ShadcnAvatar, AvatarImage, AvatarFallback } from './../atoms/avatar';

type Props = {
  src: string;
  name: string;
  className?: string;
};

const Avatar = ({ src, name, className = '' }: Props) => {
  const initials = name
    .split(' ')
    .map((word) => word.substring(0, 1))
    .join('')
    .toUpperCase();

  return (
    <ShadcnAvatar
      className={`inline-flex items-center justify-center overflow-hidden select-none w-10 h-10 rounded-full bg-neutral-200 ${className}`}
    >
      <AvatarImage src={src} alt={name} className='w-full h-full object-cover' />
      <AvatarFallback className='w-full h-full flex items-center justify-center bg-neutral-100 text-primary-600 text-sm font-medium'>
        {initials}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar;
