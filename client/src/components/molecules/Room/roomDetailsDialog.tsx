import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms';
import { FiAlertCircle } from 'react-icons/fi';

const RoomDetailsDialog = ({ isOpen, onClose, roomDetails, onSubscribe, isLoading }: any) => {
  if (!roomDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Not Found</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col items-center justify-center py-6'>
            <FiAlertCircle className='text-yellow-500 w-16 h-16 mb-4' />
            <p className='text-center text-gray-600 dark:text-gray-300'>
              Sorry, we couldn't find any details for this room.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Details</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
            <h3 className='font-semibold text-lg mb-2'>NFT ID: {roomDetails.id.toString()}</h3>
            <p className='text-sm text-gray-600 dark:text-gray-300 mb-1'>
              Visibility: {roomDetails.isPublic ? 'Public' : 'Private'}
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-300 mb-1'>
              Subscription Fee: {roomDetails.subscriptionFee.toString()} CHOW
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Subscription Token: {roomDetails.subscriptionToken}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubscribe}
            disabled={isLoading}
            className='bg-[#CB302B] hover:bg-[#A52521] text-white'
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
