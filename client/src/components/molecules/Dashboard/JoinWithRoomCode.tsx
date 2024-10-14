import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { wait5Seconds } from '@/utils';
import EthereumRpc from '@/lib/web3-rpc/';
import { useAuthContext } from '@/providers/web3-provider';
import { useBaseReadOnly } from '@/hooks/useBaseReadOnly';
import RoomDetailsDialog from '@/components/molecules/Room/roomDetailsDialog';

const JoinWithRoomCode = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, web3auth, switchNetwork } = useAuthContext();
  const { fetchNFTDetails } = useBaseReadOnly();

  const handleFetchDetails = async (roomId: any) => {
    setIsLoading(true);
    try {
      const details = await fetchNFTDetails(roomId);
      setRoomDetails(details);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching room details:', error);
      setRoomDetails(null);
      setIsDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!web3auth || !web3auth.provider || !roomDetails) {
      console.log('Web3Auth not initialized or room details not available');
      return;
    }

    setIsLoading(true);
    try {
      await switchNetwork('avalanche');
      await wait5Seconds();

      const rpc = new EthereumRpc(web3auth.provider);

      console.log('room details is ready', roomDetails);

      // Send subnet subscription payment
      const hash = await rpc.subscribe(true, roomDetails.id, roomDetails.subscriptionFee);
      console.log('Subscription successful, transaction hash:', hash);

      alert(`Subscription successful, https://subnets-test.avax.network/c-chain/tx/${hash}`);
      // Close the dialog and potentially navigate to the room
      setIsDialogOpen(false);
      // router.push(`/rooms/${roomDetails.id}`);
    } catch (error) {
      console.error('Error subscribing to room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = handleSubmit(async ({ roomId }) => {
    await handleFetchDetails(roomId);
  });

  return (
    <>
      <div className='flex flex-col items-center justify-center mb-14'>
        <label htmlFor='input-room_code' className='mb-2'>
          Have an <span className='dark:text-yellow-300 light: text-yellow-700'> NFT ID?</span> Join
          a room with it:
        </label>
        <form onSubmit={handleNavigate} className='flex mt-2'>
          <input
            id='input-room_code'
            type='number'
            placeholder='XXXXXXXXXX'
            className='w-40 h-[56px] text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
            {...register('roomId')}
          />
          <Button
            variant={'ghost'}
            type='submit'
            className='ml-2 px-8 py-2 h-[56px] dark:bg-[#27272a] bg-[#dee0e5]
            rounded-m focus:outline-none focus:ring-2 focus:ring-offset-2'
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Join'}
          </Button>
        </form>
      </div>
      <RoomDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        roomDetails={roomDetails}
        onSubscribe={handleSubscribe}
        isLoading={isLoading}
      />
    </>
  );
};

export default JoinWithRoomCode;
