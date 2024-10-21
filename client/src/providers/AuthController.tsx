'use client';

import LoadingScreen from '@/components/molecules/LoadingScreen';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChowliveLanding from '@/components/organisms/Home/PublicHome';
import { useAuthContext } from './web3-provider';

interface AuthControllerProps {
  children: React.ReactNode;
}

const AuthController: React.FC<AuthControllerProps> = ({ children }) => {
  const { user, isLoading, isPreparing } = useAuthContext();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    if (pathname === '/' && !isLoading && !user) {
      setIsAllowed(false);
    }
  }, [pathname, isLoading, user, setIsAllowed]);

  useEffect(() => {
    if (pathname.startsWith('/room') && !isAllowed) {
      setIsAllowed(true);
    }
  }, [pathname, isAllowed, setIsAllowed]);

  if (isPreparing) {
    return <LoadingScreen />;
  }

  if (isLoading && !pathname.startsWith('/room')) {
    return <LoadingScreen />;
  }

  if (!isAllowed) {
    return (
      <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative'>
        <ChowliveLanding />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthController;