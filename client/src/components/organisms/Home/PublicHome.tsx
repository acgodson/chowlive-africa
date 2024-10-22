import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { FaSpotify } from 'react-icons/fa';
import NetworkSwitcher from '@/components/molecules/NetworkSwitcher';
import { useAuthContext } from '@/providers/web3-provider';
import { sectionColors, sections } from '@/utils/helpers/consts';
import AnimatedDJSection from '@/components/molecules/PublicHome/AnimatedDJSection';
import CrossChainHarmonySection from '@/components/molecules/PublicHome/CrosschainHarmonySection';
import TestimonialSection from '@/components/molecules/PublicHome/TestimonialCard';
import SeamlessIntegrationSection from '@/components/molecules/PublicHome/SeamlessIntegrationSection';

const ChowliveLanding = () => {
  const { signIn } = useAuthContext();
  const [activeSection, setActiveSection] = useState(0);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, window.innerHeight / 2], [1, 0]);

  const [showUniting, setShowUniting] = useState(false);
  const [showSynced, setShowSynced] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

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

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observerCallback = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const sectionIndex = sectionRefs.current.findIndex((ref) => ref === entry.target);
          if (sectionIndex !== -1) {
            setActiveSection(sectionIndex);
          }
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const updatedSections = sections.slice(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const seamlessIntegrationPosition = 2 * windowHeight;

      if (scrollPosition < seamlessIntegrationPosition) {
        setActiveSection(Math.floor(scrollPosition / windowHeight));
      } else if (scrollPosition < seamlessIntegrationPosition + 2 * windowHeight) {
        setActiveSection(2);
      } else {
        setActiveSection(3);
      }
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
            <span className='hidden sm:inline'>Chowlive</span>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='md:hidden p-2'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              {isMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-4'>
            <button
              className='bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors font-bold flex items-center'
              onClick={signIn}
            >
              <FaSpotify className='mr-2' />
              Connect with Spotify
            </button>
            <NetworkSwitcher />
          </nav>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='absolute top-full left-0 right-0 bg-black bg-opacity-95 md:hidden'
              >
                <div className='flex flex-col items-center space-y-4 py-4'>
                  <button
                    className='bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors font-bold flex items-center w-[80%]'
                    onClick={signIn}
                  >
                    <FaSpotify className='mr-2' />
                    Connect with Spotify
                  </button>
                  <div className='w-[80%]'>
                    <NetworkSwitcher />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                    className="text-5xl md:text-7xl lg:text-8xl font-bold font-['Days One'] mb-4 drop-shadow-lg"
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
                    <motion.p className='text-2xl  md:text-3xl lg:text-4xl  mb-8 font-bold'>
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

        {updatedSections.map((section, index) => (
          <motion.section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el) as any}
            className={`flex flex-col items-center justify-start ${
              index === 2 ? '' : 'min-h-screen'
            } ${sectionColors[index % sectionColors.length]}`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: activeSection === index ? 1 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            {index === 1 ? (
              <CrossChainHarmonySection />
            ) : index === 2 ? (
              <SeamlessIntegrationSection />
            ) : (
              <div className='text-center max-w-2xl mt-16'>
                <h2 className="text-3xl lg:text-5xl font-bold font-['Days One'] mb-4 drop-shadow-lg">
                  {section.title}
                </h2>
                <p className='text-xl lg:text-2xl font-bold'>{section.description}</p>
              </div>
            )}

            {index === 0 && <AnimatedDJSection />}
          </motion.section>
        ))}

        <TestimonialSection />

        <footer className='bg-[#161616] text-white py-8 text-center'>
          <p className='font-light'>&copy; 2024 Chowlive. Base Africa.</p>
        </footer>
      </div>
    </>
  );
};

export default ChowliveLanding;
