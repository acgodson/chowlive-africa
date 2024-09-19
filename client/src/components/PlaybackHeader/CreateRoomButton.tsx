import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { useAuthContext } from '@/lib/AuthProvider';
import { useProfileContext } from '@/lib/UserProvider';
import { trpc } from 'src/server/client';

import { Label } from '../atoms/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../atoms/dialog';
import { Button, Input } from '../atoms';
import { RadioGroup, RadioGroupItem } from '../molecules/radioGroupItems';

export default function CreateRoomButton() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createRoom } = trpc.createRoom.useMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: profile?.displayName ? `${profile.displayName}'s Room` : 'My New Room',
      visibility: 'public',
      price: '',
    },
  });

  const visibility = watch('visibility');

  const onCreateRoom = handleSubmit(async ({ name, visibility, price }) => {
    if (!user || !profile) return;

    setIsCreatingRoom(true);
    setError(null);

    // try {
    //   const room = await createRoom({
    //     name,
    //     isPublic: visibility === 'public',
    //     creator_id: profile.id,
    //   });

    //   if (room) router.push(`/rooms/${room.slug}`);
    //   closeModal();
    // } catch (err) {
    //   setError('Failed to create room. Please try again.');
    // } finally {
    //   setIsCreatingRoom(false);
    // }
  });

  const openModal = () => setIsRoomCreationModalOpen(true);
  const closeModal = () => {
    setIsRoomCreationModalOpen(false);
    setError(null);
  };

  return (
    <>
      <Button
        className='bg-black border-2 text-white'
        onClick={openModal}
        disabled={isCreatingRoom}
        variant={'outline'}
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
              <Label htmlFor='name' className='text-gray-700 dark:text-gray-300'>
                Room Name
              </Label>
              <Input
                id='name'
                {...register('name', { required: 'Room name is required' })}
                className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
            </div>
            <div>
              <Label className='text-gray-700 dark:text-gray-300'>Room Visibility</Label>
              <Controller
                name='visibility'
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    <div className='flex items-center space-x-2 mt-4'>
                      <RadioGroupItem value='public' id='public'>
                        <Label
                          htmlFor='public'
                          className='font-normal text-gray-700 dark:text-gray-300'
                        >
                          <span className='font-bold'>Public</span>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Any user can join your room
                          </p>
                        </Label>
                      </RadioGroupItem>
                    </div>
                    <hr className='py-2' />
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='private' id='private'>
                        <Label
                          htmlFor='private'
                          className='font-normal text-gray-700 dark:text-gray-300'
                        >
                          <span className='font-bold'>Private</span>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Users can only join with a room code
                          </p>
                        </Label>
                      </RadioGroupItem>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {visibility === 'private' && (
              <div>
                <Label htmlFor='price' className='text-gray-700 dark:text-gray-300'>
                  Entry Fee
                </Label>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  {...register('price', { required: 'Entry fee is required for private rooms' })}
                  className='bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Set the cost for users to join this private room
                </p>
                {errors.price && (
                  <p className='text-red-500 text-sm mt-1'>{errors.price.message}</p>
                )}
              </div>
            )}
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <DialogFooter>
              <Button
                variant='outline'
                onClick={closeModal}
                type='button'
                className='text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              >
                Cancel
              </Button>
              <Button
                className='bg-[#CB302B] hover:bg-[#A52521] text-white'
                type='submit'
                disabled={isCreatingRoom}
              >
                {isCreatingRoom ? 'Minting...' : 'Mint Room NFT'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
