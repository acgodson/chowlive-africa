import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import crypto from 'crypto';
import { getAuth, signInWithCustomToken, User } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  IProvider,
  WEB3AUTH_NETWORK,
  UX_MODE,
} from '@web3auth/base';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter, OpenloginUserInfo } from '@web3auth/openlogin-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import RPC from '../../util/env.viem';
import { FIREBASE_CONFIG, initializeFirebase } from '@/util/firebase';
import { useFirebaseAuth } from 'src/hooks/firebase/useFirebaseAuth';
import { useWeb3Auth } from 'src/hooks/useWeb3Auth';

const clientId =
  'BFvFm-FPMxHmWGS33QbfrYe7-5mDOftplGzkM5y6eXRgkS6m9rkgVohkc_W2t5pVicZP2niXu3jJoI97RkWZrXw';

type AuthContextType =
  | {
      isAuthenticated: boolean;
      isSessionLoading: boolean;
      loggedIn: boolean;
      web3User: Partial<OpenloginUserInfo> | null;
      user: User | null;
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
  const router = useRouter();
  const [authState, setAuthState] = useState<string | null>(null);
  const { user, signOut, isSessionLoading, handleSignIn } = useFirebaseAuth();
  const {
    web3User,
    getUserInfo,
    loggedIn,
    authenticateUser,
    logout,
    getBalance,
    getAccounts,
    signMessage,
    sendTransaction,
  } = useWeb3Auth(user);

  const signIn = useCallback(() => {
    const width = 450;
    const height = 730;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const state = crypto.randomBytes(20).toString('hex');
    setAuthState(state);
    const spotifyAuthUrl = `https://spotify-auth-url`;

    window.open(
      spotifyAuthUrl,
      'Spotify Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
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

        if (data.token) {
          await handleSignIn(data.token);
        } else {
          console.error('Error getting Firebase token:', data.error);
        }
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
      } finally {
        setAuthState(null);
      }
    },
    [authState]
  );


  useEffect(() => {
    console.log('web3 user', web3User);
  }, [web3User]);

  useEffect(() => {
    const { code, state } = router.query;
    if (code && state && typeof code === 'string' && typeof state === 'string') {
      handleSpotifyCallback(code, state);
    }
  }, [router.query, handleSpotifyCallback]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isSessionLoading: isSessionLoading,
        user,
        web3User,
        loggedIn,
        signIn,
        signOut,
        getUserInfo,
        getAccounts,
        logout,
        getBalance,
        signMessage,
        sendTransaction,
        authenticateUser,
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
