import { useEffect, useState, useCallback } from 'react';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter, OpenloginUserInfo } from '@web3auth/openlogin-adapter';
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import RPC from '../util/env.viem';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { User } from 'firebase/auth';

const clientId =
  'BFvFm-FPMxHmWGS33QbfrYe7-5mDOftplGzkM5y6eXRgkS6m9rkgVohkc_W2t5pVicZP2niXu3jJoI97RkWZrXw';

export const useWeb3Auth = (user: User | null) => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [web3User, setWeb3User] = useState<Partial<OpenloginUserInfo> | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x64c',
          rpcTarget: 'https://subnets.avax.network/pearl/testnet/rpc',
          displayName: 'Intersect Testnet',
          blockExplorerUrl: 'https://subnets-test.avax.network/intersect/',
          ticker: 'Pearl',
          tickerName: 'Pearl',
        };
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            uxMode: 'redirect',
            loginConfig: {
              jwt: {
                verifier: 'chow-live',
                typeOfLogin: 'jwt',
                clientId,
              },
            },
          },
        });

        web3authInstance.configureAdapter(openloginAdapter);
        setWeb3auth(web3authInstance);

        await web3authInstance.init();
        if (web3authInstance.connected) {
          console.log('web3auth connected');
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Web3Auth initialization failed:', error);
      }
    };

    if (!web3auth) initWeb3Auth();
  }, [web3auth]);

  const connectWeb3Auth = useCallback(async () => {
    if (!user || !web3auth) return;

    try {
      const customJWT = await user.getIdToken(true);
      await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: 'jwt',
        extraLoginOptions: {
          id_token: customJWT,
          verifierIdField: 'sub',
          domain: 'http://localhost:3000',
        },
      });

      if (web3auth?.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error('Error connecting to Web3Auth:', error);
    }
  }, [user, web3auth]);

  const getUserInfo = useCallback(async () => {
    if (!web3auth) return;

    try {
      const userInfo = await web3auth.getUserInfo();
      setWeb3User(userInfo);
    } catch (error) {
      console.error('Error fetching Web3Auth user info:', error);
    }
  }, [web3auth]);

  const authenticateUser = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const idToken = await web3auth.authenticateUser();
    console.log(idToken);
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
    const handleWeb3Auth = async () => {
      if (!web3auth || !user) return;

      if (web3auth.status === 'ready' && !web3auth.connected) {
        await connectWeb3Auth();
      }

      if (web3auth.connected && loggedIn && !web3User) {
        await getUserInfo();
      }
    };

    handleWeb3Auth();
  }, [user, web3auth, loggedIn, web3User, connectWeb3Auth, getUserInfo]);

  return {
    web3auth,
    web3User,
    connectWeb3Auth,
    getUserInfo,
    loggedIn,
    authenticateUser,
    logout,
    getBalance,
    getAccounts,
    signMessage,
    sendTransaction,
  };
};
