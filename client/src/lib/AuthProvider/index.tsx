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
import {
  OpenloginAdapter,
  OpenloginUserInfo,
} from '@web3auth/openlogin-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import RPC from './env.viem';
import { FIREBASE_CONFIG, initializeFirebase } from '@/util/firebase';

const clientId =
  'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ';

type AuthContextType = {
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
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  initializeFirebase();
  const auth = getAuth();
  const router = useRouter();

  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [web3User, setWeb3User] = useState<Partial<OpenloginUserInfo> | null>(
    null
  );
  const [authState, setAuthState] = useState<string | null>(null);

  const signIn = () => {
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
  };

  // useEffect(() => {
  //   initializeFirebase();
  // }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x64c',
          rpcTarget: 'https://subnets.avax.network/pearl/testnet/rpc/',
          displayName: 'Intersect Testnet',
          blockExplorerUrl: 'https://subnets-test.avax.network/intersect/',
          ticker: 'Pearl',
          tickerName: 'Pearl',
        };
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          privateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: UX_MODE.REDIRECT,
            loginConfig: {
              jwt: {
                verifier: 'chow-live',
                typeOfLogin: 'jwt',
                clientId,
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const handleSpotifyCallback = useCallback(
    async (code: string, state: string) => {
      try {
        const response = await fetch(
          `https://us-central1-${
            FIREBASE_CONFIG.projectId
          }.cloudfunctions.net/token?code=${encodeURIComponent(
            code
          )}&state=${encodeURIComponent(state)}`,
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

  const handleSignIn = async (token: string) => {
    const userCredential = await signInWithCustomToken(auth, token);
    setUser(userCredential.user);
    Cookies.set('auth_token', token, { expires: 7, secure: true });
    const customJWT = userCredential.user.getIdToken(true);
    await web3auth?.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: customJWT,
        verifierIdField: 'sub',
        domain: 'http://localhost:3000',
      },
    });
    router.push('/');
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const idToken = await web3auth.authenticateUser();
    console.log(idToken);
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    Cookies.remove('auth_token');
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const user = await web3auth.getUserInfo();
    setWeb3User(user);
    console.log(user);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    await web3auth.logout();
    setLoggedIn(false);
  };

  const getAccounts = async () => {
    if (!web3auth?.provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const userAccount = await rpc.getAccounts();
    console.log(userAccount);
  };

  const getBalance = async () => {
    if (!web3auth?.provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const signMessage = async () => {
    if (!web3auth?.provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const result = await rpc.signMessage();
    console.log(result);
  };

  const sendTransaction = async () => {
    if (!web3auth?.provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(web3auth?.provider);
    const result = await rpc.signAndSendTransaction();
    console.log(result);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        try {
          await handleSignIn(token);
        } catch (error) {
          console.error('Error initializing with stored token:', error);
          Cookies.remove('auth_token');
        }
      }
      setIsSessionLoading(false);
    };

    initializeAuth();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user && !isSessionLoading && loggedIn && !web3User) {
      getUserInfo();
    }
  }, [user, isSessionLoading]);

  useEffect(() => {
    const { code, state } = router.query;
    if (
      code &&
      state &&
      typeof code === 'string' &&
      typeof state === 'string'
    ) {
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
    throw new Error(
      'useAuthContext must be used in combination with an AuthProvider.'
    );
  }

  return context;
};
