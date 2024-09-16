import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSpotify } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useSpring, animated, config } from 'react-spring';
import Layout from '../Layout';
import ColorModeButton from '../ColorModeButton';
import { useAuthContext } from '@/lib/AuthProvider';
import { Button } from '../atoms';
import HeroCard from '../atoms/heroCard';
import AnimatedEqualizer from '../atoms/animatedEqualizer';

const AnimatedSuffix = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);
  const { theme } = useTheme();

  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    reset: true,
    config: config.gentle,
    key: key,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
      setKey((current) => current + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [words.length]);

  const colors = ['text-[#fcefdc]', 'text-[#fcefdc]', 'text-[#fcefdc]'];

  return (
    <span className='inline-block w-fit-content'>
      <animated.span
        style={props}
        className={`inline-block font-bold 
        
        ${theme === 'dark' ? colors[index] : 'text-[#fad075]'}`}
      >
        {words[index]}
      </animated.span>
    </span>
  );
};

const PublicHome = () => {
  const { theme } = useTheme();
  const { signIn } = useAuthContext();
  const suffixes = ['Listen', 'Vibe', 'Queue'];

  return (
    <Layout publicRoute>
      <div className='min-h-screen bg-gradient-to-br from-background to-background-light dark:from-background dark:to-background-dark'>
        <div className='container mx-auto px-4 py-8'>
          <header className='flex justify-between items-center mb-16'>
            <Image
              src='/logo.svg'
              height={70}
              width={70}
              alt='Listen Together logo'
              className='transition-transform duration-300 hover:scale-110'
            />
            <ColorModeButton className='text-2xl' />
          </header>
          <main>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-16'>
              <div className='flex-1 space-y-8'>
                <div className='flex flex-col justify-start space-y-0'>
                  <div className='pl-24 bg-transparent'>
                    <AnimatedEqualizer
                      barCount={15}
                      color={theme === 'dark' ? '#4CAF50' : '#4CAF50'}
                    />
                  </div>
                  <div>
                    <h1 className='text-5xl sm:text-5xl md:text-6xl font-bold text-foreground'>
                      Connect to <AnimatedSuffix words={suffixes} />
                    </h1>
                  </div>
                </div>

                <h2 className='text-2xl sm:text-3xl text-muted-foreground'>
                  Songs we love in common.
                </h2>
                <p className='text-xl max-w-2xl text-foreground'>
                  Invite friends, add songs from Spotify, and enjoy your playlists in perfect sync.
                  Experience music like never before.
                </p>
                <Button
                  size='lg'
                  className='rounded-lg bg-green-500 text-2xl h-16 px-8 hover:bg-green-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg'
                  onClick={signIn}
                >
                  <FaSpotify className='mr-3 text-3xl' />
                  Login with Spotify
                </Button>
              </div>

              <div className='flex-1 relative h-[500px] w-full max-w-[600px]'>
                <HeroCard
                  imageSrc='/dj-static.png'
                  alt='DJ Static 1'
                  className='absolute left-0 top-0 transform -rotate-6 z-10 hover:z-30'
                />

                <div className='absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-20 rounded-lg animate-pulse'></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default PublicHome;
