'use client';

import React, {
  createContext,
  PropsWithChildren,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from 'firebase/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { customAlphabet } from 'nanoid';
import { OpenloginUserInfo } from '@web3auth/openlogin-adapter';
import { FIREBASE_CONFIG } from '@/utils/configs/firebase-app-config';
import { useFirebaseAuth } from '@/hooks/firebase/useFirebaseAuth';
import { useWeb3Auth } from '@/hooks/web3auth/useWeb3Auth';
import { networks } from '@/utils/configs/web3';
import { toHex } from 'viem';

const generateRandomString = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  20
);

type AuthContextType =
  | {
      isAuthenticated: boolean;
      isSessionLoading: boolean;
      loggedIn: boolean;
      web3User: Partial<OpenloginUserInfo> | null;
      user: User | null;
      selectedNetwork: any;
      isPreparing: boolean;
      handleNetworkChange: React.ChangeEventHandler<HTMLSelectElement>;
      signIn: () => void;
      signOut: () => void;
      getUserInfo: () => void;
      getAccounts: () => void;
      getBalance: () => void;
      signMessage: () => void;
      authenticateUser: () => void;
      sendTransaction: () => void;
      logout: () => void;
    }
  | any;

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const { user, signOut, isSessionLoading, handleSignIn } = useFirebaseAuth();
  const {
    web3User,
    web3auth,
    getUserInfo,
    loggedIn,
    authenticateUser,
    logout,
    getBalance,
    getAccounts,
    switchNetwork,
    currentChainConfig,
    fetching,
    setFetching,
  } = useWeb3Auth(user);

  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<any | null>(null);
  const [nativeBalance, setNativeBalance] = useState<any>(0);

  const handleNetworkChange: React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
    const network = networks.find((n) => n.id === e.target.value);
    if (network) {
      setSelectedNetwork(network);
      await switchNetwork(network.id as 'base' | 'sepolia' | 'optimism' | 'avalanche');
      // setNativeBalance(0);
      setFetching(true);
    }
  };

  const signIn = useCallback(() => {
    const width = 450;
    const height = 730;
    const randomString = generateRandomString();
    const state = toHex(randomString, { size: 20 });

    setAuthState(state);
    const spotifyAuthUrl = `https://us-central1-${
      FIREBASE_CONFIG.projectId
    }.cloudfunctions.net/redirect?state=${encodeURIComponent(state)}`;

    // Save the current URL to localStorage before redirecting
    localStorage.setItem('redirectUrl', window.location.href);
    // Redirect to the Spotify auth URL in the same window
    window.location.href = spotifyAuthUrl;
  }, []);

  const handleSpotifyCallback = useCallback(
    async (code: string, state: string) => {
      try {
        const response = await fetch(
          `https://us-central1-${
            FIREBASE_CONFIG.projectId
          }.cloudfunctions.net/token?code=${encodeURIComponent(code)}&state=${encodeURIComponent(
            state
          )}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('returned token', data.token);

        if (data.token) {
          await handleSignIn(data.token);
          await authenticateUser();
        } else {
          console.error('Error getting Firebase token:', data.error);
        }
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
      } finally {
        setAuthState(null);
        // setIsPreparing(false);
        // Clear the query parameters
        const params = new URLSearchParams(searchParams.toString());
        params.delete('code');
        params.delete('state');
        router.replace(`${pathname}?${params.toString()}`);
      }
    },
    [authState]
  );

  useEffect(() => {
    const fetchAccount = async () => {
      if (!web3User || !web3auth?.provider) return;
      try {
        const accounts = await getAccounts();
        console.log('cc', accounts);
        if (accounts?.length) {
          setAddress(accounts);
          const balance = await getBalance();
          console.log('Logged in account balance:', balance);
          if (balance) {
            setNativeBalance(parseFloat(balance).toFixed(3));
          }
        }
      } catch (error) {
        console.error('Error fetching account:', error);
      } finally {
        setFetching(false);
      }
    };

    if (fetching && currentChainConfig) {
      fetchAccount();
    }
  }, [
    web3User,
    web3auth,
    address,
    fetching,
    currentChainConfig,
    setNativeBalance,
    setAddress,
    setFetching,
  ]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      setIsPreparing(true);
      if (code.length > 0) {
        handleSpotifyCallback(code, state);
      }
    }
  }, [searchParams, handleSpotifyCallback]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!user,
        isSessionLoading: isSessionLoading,
        user,
        address,
        web3User,
        web3auth,
        loggedIn,
        selectedNetwork,
        isPreparing,
        signIn,
        signOut,
        getUserInfo,
        getAccounts,
        logout,
        getBalance,
        authenticateUser,
        switchNetwork,
        handleNetworkChange,
        currentChainConfig,
        nativeBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuthContext must be used in combination with an AuthProvider.');
  }

  return context;
};
