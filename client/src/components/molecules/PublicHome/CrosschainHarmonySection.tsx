import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CrossChainHarmonySection = () => {
  const networks = [
    { name: 'Ethereum', logo: '/images/ethereum.png' },
    { name: 'Superchain', logo: '/images/superchain.svg' },
    { name: 'Avalanche', logo: '/images/avalanche.svg' },
  ];

  return (
    <div className='relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 py-8'>
      <div className='absolute inset-0 z-0'>
        <Image
          src='/images/music-notes-background.svg'
          alt='Music notes background'
          layout='fill'
          objectFit='cover'
          className='opacity-10'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black via-black to-transparent opacity-75'></div>
      </div>

      <div className='relative z-10 max-w-6xl w-full flex flex-col md:flex-row items-center justify-between'>
        <div className='md:w-3/5 text-left md:pr-8'>
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold font-['Days One'] mb-6 text-white"
          >
            Cross Chain Harmony
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='text-lg md:text-2xl text-white mb-10'
          >
            Groove across ecosystems! Join music rooms, chat with friends, and claim new perks -
            whether on Ethereum, Superchains, or Avalanche. Your beat!
          </motion.p>

          <motion.div
            className='flex flex-wrap justify-start items-center gap-8 mb-8'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {networks.map((network) => (
              <motion.div
                key={network.name}
                className='flex flex-col items-center'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src={network.logo}
                  alt={`${network.name} logo`}
                  width={64}
                  height={64}
                  className='mb-2'
                />
                <p className='text-white text-sm font-semibold'>{network.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className='md:w-2/5 flex justify-center items-center mt-8 md:mt-0'
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Image
            src='/mc/Chowlive_Character(4).png'
            alt='DJ Avatar'
            width={400}
            height={400}
            className='rounded-full'
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CrossChainHarmonySection;
