import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Button } from '../atoms';

const JoinWithRoomCode = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const handleNavigate = handleSubmit(({ slug }) => {
    router.push(`/rooms/${slug.trim()}`);
  });

  return (
    <div className='flex flex-col items-center justify-center mb-14'>
      <label htmlFor='input-room_code' className='mb-2'>
        Have a room ID? Join a room with it:
      </label>
      <form onSubmit={handleNavigate} className='flex mt-2'>
        <input
          id='input-room_code'
          type='number'
          placeholder='XXXXXXXXXX'
          className='w-40 h-[56px] text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
          {...register('slug')}
        />
        <Button
          variant={'ghost'}
          type='submit'
          className='ml-2 px-8 py-2 h-[56px] dark:bg-[#27272a] bg-[#dee0e5]
          rounded-m focus:outline-none focus:ring-2 focus:ring-offset-2'
        >
          Subscribe
        </Button>
      </form>
    </div>
  );
};

export default JoinWithRoomCode;
