import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  roomId: string;
  userId: string;
  storeOwner: {
    storeId: string;
    storeName: string;
  };
};

const RoomPerks = ({ roomId, userId, storeOwner }: Props) => {
  const items = [
    { id: 2, name: '20% Off Meal Coupon', price: 0, icon: '🍕', type: 'coupon', discount: 20 },
    { id: 3, name: 'Concert Ticket', price: 0, icon: '🎫', type: 'ticket' },
    // { id: 1, name: 'VIP Room Badge', price: 5, icon: '🌟', type: 'digital' },
    // { id: 4, name: 'Song Request Priority', price: 3, icon: '🎵', type: 'digital' },
  ];

  const handlePurchase = (item: any) => {
    // ... (handlePurchase logic remains the same)
  };

  const generateCouponCode = (item: any) => {
    // ... (generateCouponCode logic remains the same)
  };

  const generateTicketCode = () => {
    // ... (generateTicketCode logic remains the same)
  };

  return (
    <div className='w-full p-4 sm:p-6 rounded-xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg'>
      <p className='mb-4 sm:mb-6 text-base sm:text-lg text-gray-200'>
        Exclusive offers from Chowlive to room members!
      </p>
      <div className='flex flex-wrap -mx-2'>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className='w-full sm:w-1/2 lg:w-1/2 xl:w-1/2 px-2 mb-4'
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className='bg-white bg-opacity-20 p-4 sm:p-6 rounded-xl shadow-lg backdrop-filter backdrop-blur-md h-full flex flex-col justify-between'>
              <div>
                <div className='flex items-center mb-2 sm:mb-4'>
                  <span className='text-3xl sm:text-4xl mr-2 sm:mr-3'>{item.icon}</span>
                  <h3 className='text-lg sm:text-xl font-semibold text-white'>{item.name}</h3>
                </div>
                <p className='text-gray-300 mb-2 sm:mb-4 text-sm sm:text-base'>
                  {item.type === 'coupon'
                    ? `${item.discount}% off at ${storeOwner.storeName}`
                    : item.type === 'ticket'
                    ? 'Access to exclusive concert'
                    : 'Enhance your room experience'}
                </p>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xl opacity-30 sm:text-2xl font-bold text-white'>
                  ${item.price}
                </span>
                <button
                  disabled={true}
                  onClick={() => handlePurchase(item)}
                  className='opacity-30 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base'
                >
                  Claim
                </button>
                <p className='text-xs mt-2 italic'>coming soon</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoomPerks;
