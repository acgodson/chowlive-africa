import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import crypto from 'crypto';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { OpenloginUserInfo } from '@web3auth/openlogin-adapter';
import { FIREBASE_CONFIG } from '@/util/firebase';
import { useFirebaseAuth } from 'src/hooks/firebase/useFirebaseAuth';
import { useWeb3Auth } from 'src/hooks/useWeb3Auth';

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
    web3auth,
    getUserInfo,
    loggedIn,
    authenticateUser,
    logout,
    getBalance,
    getAccounts,
    signMessage,
    sendTransaction,
    switchNetwork,
    currentChainConfig,
    fetching,
    setFetching,
  } = useWeb3Auth(user);
  const [address, setAddress] = useState<any | null>(null);
  const [nativeBalance, setNativeBalance] = useState<any>(0);

  const signIn = useCallback(() => {
    const width = 450;
    const height = 730;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const state = crypto.randomBytes(20).toString('hex');
    setAuthState(state);
    const spotifyAuthUrl = `https://us-central1-${
      FIREBASE_CONFIG.projectId
    }.cloudfunctions.net/redirect?state=${encodeURIComponent(state)}`;

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
    const fetchAccount = async () => {
      if (!web3User || !web3auth?.provider) return;
      try {
        const accounts = await getAccounts();
        if (accounts?.length) {
          console.log('Logged in address:', accounts);
          setAddress(accounts[0]);
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

  // useEffect(() => {
  //   console.log(currentChainConfig);
  // }, [fetching]);

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
        address,
        web3User,
        web3auth,
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
        switchNetwork,
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
