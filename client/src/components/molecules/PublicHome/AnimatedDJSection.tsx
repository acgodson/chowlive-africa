import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AnimatedDJSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const imageUrl = '/mc/Chowlive_Character(13).png';
  const videoUrl = '/videos/CHOW_LIFE.mp4';
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });
  const videoRef: any = useRef(null);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isVideoMode) {
      setIsVideoMode(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setIsVideoMode(false);
  };

  return (
    <div
      ref={sectionRef}
      className='relative z-10 mt-8 w-full max-w-4xl h-[60vh] flex items-center justify-center'
    >
      <div className='absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-50 rounded-lg animate-gradient-x'></div>
      <div className='absolute inset-0 backdrop-blur-sm rounded-lg'></div>
      <AnimatePresence mode='wait'>
        {isInView && (
          <motion.div
            key={isVideoMode ? 'video' : 'image'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full relative'
          >
            {isVideoMode ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className='w-full h-full object-cover rounded-lg'
                muted={isMuted}
                onEnded={handleVideoEnd}
              />
            ) : (
              <Image
                src={imageUrl}
                alt='dj-chowlive'
                layout='fill'
                objectFit='contain'
                className='rounded-lg'
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className='absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg'
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        <div className='flex justify-between items-center'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayPause}
            className='text-white text-2xl'
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </motion.button>
          <div className='flex-1 mx-4'>
            <div className='bg-gray-300 h-2 rounded-full'>
              <motion.div
                className='bg-green-500 h-full rounded-full'
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '0%' }}
                transition={{ duration: 30, ease: 'linear' }}
              ></motion.div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMute}
            className='text-white text-2xl'
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </motion.button>
        </div>
      </motion.div>
      <div className='absolute top-4 left-4 right-4 flex justify-between'>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className='bg-white text-black px-3 py-1 rounded-full text-sm font-bold'
        >
          Live
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className='bg-white text-black px-3 py-1 rounded-full text-sm font-bold'
        >
          1.2k listening
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedDJSection;
