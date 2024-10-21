import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '@/utils/helpers/consts';

const TestimonialSection = () => {
  return (
    <section className='py-16 pb-32 bg-gradient-to-br from-[#000000] to-[#1a1a1a] overflow-hidden'>
      <div className='container mx-auto px-4'>
        <h2 className="text-5xl font-bold font-['Days One'] text-center mb-12 text-white">
          Friends Inspire Us
        </h2>
        <div className='flex justify-center items-end space-x-4 h-[70vh] mt-8 mb-16'>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, index }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef : any = useRef(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      className={`relative w-[30%] aspect-[9/16] rounded-lg overflow-hidden transform ${
        index === 0 ? 'translate-y-32' : index === 1 ? 'translate-y-16' : ''
      }`}
      style={{ height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence initial={false}>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              layout='fill'
              objectFit='cover'
              className='rounded-lg'
            />
          </motion.div>
        )}
      </AnimatePresence>
      <video
        ref={videoRef}
        src={testimonial.video}
        className={`absolute inset-0 w-full h-full object-cover rounded-lg ${
          isPlaying ? 'block' : 'hidden'
        }`}
        onEnded={() => setIsPlaying(false)}
      />
      <motion.div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isHovered ? 'bg-opacity-30' : 'bg-opacity-50'
        }`}
      >
        {!isPlaying && (
          <motion.button
            className='absolute inset-0 flex items-center justify-center'
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
          >
            <FaPlayCircle className='text-6xl text-white opacity-80 hover:opacity-100 transition-opacity' />
          </motion.button>
        )}
        {isPlaying && isHovered && (
          <motion.button
            className='absolute inset-0 flex items-center justify-center'
            onClick={handlePause}
            whileHover={{ scale: 1.1 }}
          >
            <FaPauseCircle className='text-6xl text-white opacity-80 hover:opacity-100 transition-opacity' />
          </motion.button>
        )}
      </motion.div>
      <motion.div
        className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4'
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className='font-bold text-lg'>{testimonial.name}</p>
        <p className='text-sm text-gray-300'>{testimonial.title}</p>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialSection;