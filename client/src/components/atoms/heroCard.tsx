import React from 'react';
import Image from 'next/image';
import { useSpring, animated } from 'react-spring';
import { useTheme } from 'next-themes';

const HeroCard = ({
  imageSrc,
  alt,
  className,
}: {
  imageSrc: string;
  alt: string;
  className: string;
}) => {
  const [props, set] = useSpring(() => ({
    scale: 1,
    rotateZ: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  }));
  const { theme } = useTheme();

  return (
    <animated.div
      className={`relative group ${className}`}
      style={props}
      onMouseEnter={() => set({ scale: 1.05, rotateZ: 5 })}
      onMouseLeave={() => set({ scale: 1, rotateZ: 0 })}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 rounded-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-gradient-x'></div>
      <div className='relative bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 p-1 rounded-lg'>
        <div
          className={`${
            theme === 'light' ? 'bg-[whitesmoke]' : 'bg-[#1a1c20]'
          } overflow-hidden relative`}
        >
          <div className='rounded-lg  h-[500px] w-[300px] transition-all duration-300 group-hover:scale-105 relative'>
            <Image
              src={imageSrc}
              height={600}
              width={400}
              alt={alt}
              className='rounded-lg bottom-0 -mb-16 ml-[150px]  center transition-all duration-300 absolute'
            />
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default HeroCard;
