import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { useAuthContext } from '@/lib/AuthProvider';
import { useProfileContext } from '@/lib/UserProvider';
import { trpc } from 'src/server/client';

import { Label } from '../atoms/label';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../atoms/dialog';
import { Button, Input } from '../atoms';
import { RadioGroupItem, RadioGroup } from '../molecules/radioGroupItems';

export default function CreateRoomButton() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const { mutateAsync: createRoom } = trpc.createRoom.useMutation();

  const { register, handleSubmit } = useForm();

  const onCreateRoom = handleSubmit(async ({ name, visibility }) => {
    if (!user || !profile) return;

    setIsCreatingRoom(true);

    const room = await createRoom({
      name,
      isPublic: visibility === 'public',
      creator_id: profile.id,
    });

    if (room) router.push(`/rooms/${room.slug}`);

    setIsCreatingRoom(false);
    closeModal();
  });

  const openModal = () => setIsRoomCreationModalOpen(true);
  const closeModal = () => setIsRoomCreationModalOpen(false);

  return (
    <>
      <Button
        className='bg-green-500 hover:bg-green-600 text-white'
        onClick={openModal}
        disabled={isCreatingRoom}
      >
        <FiPlus className='mr-2' />
        Create Room
      </Button>
      <Dialog open={isRoomCreationModalOpen} onOpenChange={setIsRoomCreationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreateRoom} className='space-y-4'>
            <div>
              <Label htmlFor='name'>Room Name</Label>
              <Input
                id='name'
                defaultValue={
                  profile?.displayName ? `${profile?.displayName}'s Room` : 'My New Room'
                }
                {...register('name')}
              />
            </div>
            <div>
              <Label>Room Visibility</Label>
              <RadioGroup name={'visiblity'} /*defaultValue='public'*/>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='public' id='public' {...register('visibility')} />
                  <Label htmlFor='public' className='font-normal'>
                    <span className='font-bold'>Public</span>
                    <p className='text-sm text-gray-500'>Any user can join your room</p>
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='private' id='private' {...register('visibility')} />
                  <Label htmlFor='private' className='font-normal'>
                    <span className='font-bold'>Private</span>
                    <p className='text-sm text-gray-500'>Users can only join with a room code</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={closeModal} type='button'>
                Cancel
              </Button>
              <Button className='bg-green-500 hover:bg-green-600 text-white' type='submit'>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
