import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { FaSpotify, FaQuoteLeft, FaPlayCircle, FaPauseCircle } from 'react-icons/fa';

import NetworkSwitcher from '@/components/molecules/NetworkSwitcher';
import { useAuthContext } from '@/providers/web3-provider';
import { sectionColors, sections, testimonials, toastQuotes } from '@/utils/helpers/consts';

const ChowliveLanding = () => {
  const { signIn } = useAuthContext();
  const [activeSection, setActiveSection] = useState(0);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, window.innerHeight / 2], [1, 0]);

  const [showUniting, setShowUniting] = useState(false);
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    const unitingTimer = setTimeout(() => setShowUniting(true), 1000);
    const syncedTimer = setTimeout(() => setShowSynced(true), 3500);

    return () => {
      clearTimeout(unitingTimer);
      clearTimeout(syncedTimer);
    };
  }, []);

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const TestimonialCard = ({ testimonial, index }: any) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const videoRef: any = useRef(null);

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
      <div
        className={`relative w-[30%] aspect-[9/16] rounded-lg overflow-hidden transform ${
          index === 0 ? 'translate-y-32' : index === 1 ? 'translate-y-16' : ''
        }`}
        style={{ height: '100%' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isPlaying && (
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            layout='fill'
            objectFit='cover'
            className='rounded-lg'
          />
        )}
        <video
          ref={videoRef}
          src={testimonial.video}
          className={`absolute inset-0 w-full h-full object-cover rounded-lg ${
            isPlaying ? 'block' : 'hidden'
          }`}
          onEnded={() => setIsPlaying(false)}
        />
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'bg-opacity-0' : 'bg-opacity-50'
          }`}
        >
          {!isPlaying && (
            <button
              className='absolute inset-0 flex items-center justify-center'
              onClick={handlePlay}
            >
              <FaPlayCircle className='text-6xl text-white opacity-80 hover:opacity-100 transition-opacity' />
            </button>
          )}
          {isPlaying && isHovered && (
            <button
              className='absolute inset-0 flex items-center justify-center'
              onClick={handlePause}
            >
              <FaPauseCircle className='text-6xl text-white opacity-80 hover:opacity-100 transition-opacity' />
            </button>
          )}
        </div>
        <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4'>
          <p className='font-bold text-lg'>{testimonial.name}</p>
          {/* <p className='text-sm'>Real-life party experience</p> */}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const newActiveSection = Math.floor(window.scrollY / window.innerHeight);
      setActiveSection(newActiveSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=Days+One&family=Neue+Haas+Grotesk+Display+Pro:wght@400;700&display=swap'
          rel='stylesheet'
        />
        <style>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.9;
            }
            100% {
              transform: scale(1);
              opacity: 0.7;
            }
          }

          .dj-halo::before {
            content: '';
            position: absolute;
            top: 6%;
            left: 43%;
            transform: translateX(-50%);
            width: 160px;
            height: 160px;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
            border-radius: 50%;
            animation: pulse 2s infinite ease-in-out;
            z-index: -1;
          }
        `}</style>
      </Head>

      <div className="min-h-screen text-white font-['Neue Haas Grotesk Display Pro']">
        <header className='fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-2 bg-black bg-opacity-0 backdrop-filter backdrop-blur-lg'>
          <div className="text-3xl font-bold font-['Days One'] flex items-center">
            <Image alt='chowlive-icon' height={50} width={50} src='/logo.svg' className='mr-2' />
            Chowlive
          </div>
          <nav className='flex items-center space-x-4'>
            <button
              className='bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors font-bold flex items-center'
              onClick={signIn}
            >
              <FaSpotify className='mr-2' />
              Connect with Spotify
            </button>
            <NetworkSwitcher />
          </nav>
        </header>

        <motion.section
          style={{ opacity }}
          className='h-screen flex items-center justify-center bg-gradient-to-br from-[#FCEFDC] to-[#333] relative'
        >
          <video autoPlay loop muted className='absolute w-full h-full object-cover'>
            <source src='/videos/vibing.mp4' type='video/mp4' />
            Your browser does not support the video tag.
          </video>

          <div className='absolute inset-0 bg-gradient-to-br from-black via-black to-transparent opacity-90'></div>
          <div className='relative z-10 text-center w-full px-4 h-screen flex flex-col justify-center items-center'>
            <div className='space-y-8'>
              <AnimatePresence mode='wait'>
                {showUniting && (
                  <motion.h1
                    key='uniting'
                    variants={titleVariants}
                    initial='hidden'
                    animate='visible'
                    transition={{ duration: 1, type: 'spring', stiffness: 50 }}
                    className="text-8xl font-bold font-['Days One'] mb-4 drop-shadow-lg"
                  >
                    Uniting friends on-chain
                  </motion.h1>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSynced && (
                  <motion.div
                    variants={contentVariants}
                    initial='hidden'
                    animate='visible'
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <motion.p className='text-4xl mb-8 font-bold'>
                      Synced music playbacks and epic listening parties
                    </motion.p>
                    <motion.button
                      onClick={signIn}
                      className='mt-10 bg-[#1DB954] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors font-bold flex items-center justify-center mx-auto'
                    >
                      <FaSpotify className='mr-2' />
                      Get Started with Spotify
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {sections.map((section, index) => (
          <motion.section
            key={index}
            className={`h-screen flex flex-col items-center justify-start sticky top-0 bg-gradient-to-br ${
              sectionColors[index % sectionColors.length]
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: activeSection === index ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='text-center max-w-2xl mt-16'>
              <h2 className="text-5xl font-bold font-['Days One'] mb-4 drop-shadow-lg">
                {section.title}
              </h2>
              <p className='text-2xl font-bold'>{section.description}</p>
            </div>

            {index === 1 && (
              <div className='relative z-10 mt-8 w-full max-w-4xl h-[60vh] flex items-center justify-center dj-halo'>
                <Image
                  src='/images/prop-dj.png'
                  alt='dj-chowlive'
                  layout='fill'
                  objectFit='contain'
                  className='rounded-lg'
                />
              </div>
            )}

            {index === 0 && (
              <motion.div
                className='absolute top-0 left-1/2 transform -translate-x-1/2 bg-white text-black p-4 rounded-lg shadow-lg'
                initial={{ y: '100%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              >
                {toastQuotes.map((quote, i) => (
                  <div key={i} className='flex items-center mb-4 last:mb-0'>
                    <FaQuoteLeft className='text-[#1DB954] mr-2' />
                    <p className='font-bold'>{quote}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {index === 0 && (
              <div className='relative z-10 p-28 w-[90vw] h-[calc(90vw*9/16)] max-w-[1600px] max-h-[900px]'>
                <iframe
                  width='100%'
                  height='100%'
                  src='https://www.youtube.com/embed/tpM6FxasJ6o?si=HXyxVtM23JBAgF3D'
                  title='YouTube video player'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  referrerPolicy='strict-origin-when-cross-origin'
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </motion.section>
        ))}

        <section className='py-16 pb-32 bg-gradient-to-br from-[#000000] to-black overflow-hidden'>
          <h2 className="text-4xl font-bold font-['Days One'] px-6 text-left mb-8">
            Friends Inspire Us
          </h2>
          <div className='container mx-auto px-4'>
            <div className='container mx-auto px-4'>
              <div className='flex justify-center items-end space-x-4 h-[70vh] mt-8 mb-16'>
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className='bg-[#161616] text-white py-8 text-center'>
          <p className='font-light'>&copy; 2024 Chowlive. Base Africa.</p>
        </footer>
      </div>
    </>
  );
};

export default ChowliveLanding;
