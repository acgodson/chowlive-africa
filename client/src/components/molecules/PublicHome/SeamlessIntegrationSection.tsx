import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSpotify, FaWallet, FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const SeamlessIntegrationSection = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [FaSpotify, FaWallet, FaCheckCircle, FaShoppingBag];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative w-full min-h-[150vh] flex flex-col justify-between overflow-hidden px-4 py-0 bg-black'>
      {/* <div className='relative w-full flex flex-col justify-between overflow-hidden px-4 py-16 bg-black'> */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute inset-0 opacity-10'>
          <div className='w-full h-full bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 filter blur-3xl'></div>
        </div>
      </div>
      <div className='relative z-10 max-w-6xl w-full mx-auto flex flex-col justify-between h-full'>
        <div className='flex flex-col-reverse md:flex-row items-center justify-between mb-32'>
          <motion.div
            className='md:w-1/2 flex justify-center items-center mt-8 md:mt-0 relative'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className='absolute inset-0 z-0'>
              <svg className='w-full h-full' viewBox='0 0 200 200'>
                <defs>
                  <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%' stopColor='#7928CA' />
                    <stop offset='100%' stopColor='#FF0080' />
                  </linearGradient>
                </defs>
                <g>
                  <circle
                    cx='100'
                    cy='100'
                    r='75'
                    fill='none'
                    stroke='url(#gradient)'
                    strokeWidth='0.5'
                    opacity='0.3'
                  />
                  <circle
                    cx='100'
                    cy='100'
                    r='77'
                    fill='none'
                    stroke='url(#gradient)'
                    strokeWidth='0.5'
                    opacity='0.3'
                  >
                    <animate
                      attributeName='r'
                      values='77;79;77'
                      dur='2s'
                      repeatCount='indefinite'
                    />
                    <animate
                      attributeName='opacity'
                      values='0.3;0.5;0.3'
                      dur='2s'
                      repeatCount='indefinite'
                    />
                  </circle>
                </g>
              </svg>
            </div>
            <Image
              src='/mc/Chowlive_Character(9).png'
              alt='Chill Avatar'
              width={450}
              height={450}
              className='rounded-full z-10'
            />
            <div className='absolute bottom-0 left-1/4 transform -translate-x-1/2 translate-y-1/3 bg-white rounded-full p-8 z-20'>
              <motion.div
                key={currentIcon}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className='w-20 h-20 flex items-center justify-center'
              >
                {React.createElement(icons[currentIcon], { size: 48, color: '#000' })}
              </motion.div>
            </div>
          </motion.div>

          <div className='md:w-1/2 text-left md:pl-8'>
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold font-['Days One'] mb-6 text-white"
            >
              Seamless Integration
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-lg md:text-2xl text-white mb-10'
            >
              Login with Spotify and get a{' '}
              <span className='text-[#0052FF] font-bold'>Coinbase</span> smart wallet associated
              with your Spotify account to interact with the blockchain. Enjoy free and gasless on{' '}
              <span className='text-[#0052FF] font-bold'>Base</span>
            </motion.p>
            <motion.button
              className='bg-[#1DB954] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors font-bold'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>

        <div className='flex flex-col md:flex-row-reverse items-center justify-between'>
          <motion.div
            className='md:w-1/2 flex justify-center items-center mt-8 md:mt-0 relative'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className='absolute inset-0 z-0'>
              {/* Add a new animated shape here if desired */}
              <svg className='w-full h-full' viewBox='0 0 200 200'>
                <defs>
                  <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%' stopColor='#7928CA' />
                    <stop offset='100%' stopColor='#FF0080' />
                  </linearGradient>
                </defs>
                <g>
                  <circle
                    cx='100'
                    cy='100'
                    r='75'
                    fill='none'
                    stroke='url(#gradient)'
                    strokeWidth='0.5'
                    opacity='0.3'
                  />
                  <circle
                    cx='100'
                    cy='100'
                    r='77'
                    fill='none'
                    stroke='url(#gradient)'
                    strokeWidth='0.5'
                    opacity='0.3'
                  >
                    <animate
                      attributeName='r'
                      values='77;79;77'
                      dur='2s'
                      repeatCount='indefinite'
                    />
                    <animate
                      attributeName='opacity'
                      values='0.3;0.5;0.3'
                      dur='2s'
                      repeatCount='indefinite'
                    />
                  </circle>
                </g>
              </svg>
            </div>
            <Image
              src='/mc/Chowlive_Character(5).png'
              alt='Shopping Avatar'
              width={450}
              height={450}
              className='rounded-full z-10'
            />
            <div className='absolute top-0 right-0/4 transform translate-x-1/2 -translate-y-1/3 bg-white rounded-full p-8 z-20'>
              <motion.div
                key={currentIcon}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className='w-20 h-20 flex items-center justify-center'
              >
                <FaShoppingBag size={48} color='#000' />
              </motion.div>
            </div>
          </motion.div>

          <div className='md:w-1/2 text-left md:pr-8'>
            <motion.h2
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold font-['Days One'] mb-6 text-white"
            >
              Beyond Just Music
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-lg md:text-2xl text-white mb-10'
            >
              Chowlive isn't just about shared music experiences. Create custom rooms with featured
              extensions, allowing listeners to browse and claim curated perks while enjoying the
              tunes. Transform your musical space into a vibrant reward zone!
            </motion.p>
            <motion.button
              className='bg-[#1DB954] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors font-bold'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Explore Room Perks
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeamlessIntegrationSection;
