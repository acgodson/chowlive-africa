import React from 'react';
import AnimatedEqualizer from '../atoms/animatedEqualizer';

const LoadingScreen: React.FC = () => {
  return (
    <div className='fixed inset-0 bg-black/45 flex items-center justify-center'>
      <AnimatedEqualizer />
    </div>
  );
};

export default LoadingScreen;
