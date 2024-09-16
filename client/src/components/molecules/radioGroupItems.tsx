import React, { createContext, useContext, ReactNode } from 'react';

interface RadioGroupContextType {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  name: string;
  defaultValue?: string;
  children: ReactNode;
  onChange?: (value: string) => void;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  children?: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  defaultValue,
  onChange,
  children,
}) => {
  const [value, setValue] = React.useState(defaultValue || '');

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <RadioGroupContext.Provider value={{ name, value, onChange: handleChange }}>
      <div className='space-y-2'>{children}</div>
    </RadioGroupContext.Provider>
  );
};

export const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a RadioGroup');
  }
  return context;
};

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id, children }) => {
  const { name, value: groupValue, onChange } = useRadioGroup();

  return (
    <div className='flex items-center space-x-2'>
      <input
        type='radio'
        id={id}
        name={name}
        value={value}
        checked={value === groupValue}
        onChange={() => onChange(value)}
        className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500'
      />
      {children}
    </div>
  );
};

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

export default function CreateRoomButton() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const { mutateAsync: createRoom } = trpc.createRoom.useMutation();

  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: profile?.displayName ? `${profile?.displayName}'s Room` : 'My New Room',
      visibility: 'public',
    },
  });

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
              <Input id='name' {...register('name')} />
            </div>
            <div>
              <Label>Room Visibility</Label>
              <Controller
                name='visibility'
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    name={field.name}
                    defaultValue={field.value}
                    onChange={field.onChange}
                  >
                    <RadioGroupItem value='public' id='public'>
                      <Label htmlFor='public' className='font-normal'>
                        <span className='font-bold'>Public</span>
                        <p className='text-sm text-gray-500'>Any user can join your room</p>
                      </Label>
                    </RadioGroupItem>
                    <RadioGroupItem value='private' id='private'>
                      <Label htmlFor='private' className='font-normal'>
                        <span className='font-bold'>Private</span>
                        <p className='text-sm text-gray-500'>
                          Users can only join with a room code
                        </p>
                      </Label>
                    </RadioGroupItem>
                  </RadioGroup>
                )}
              />
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
