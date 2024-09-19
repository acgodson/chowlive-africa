import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiCheck, FiCopy, FiSettings } from 'react-icons/fi';
import { useAuthContext } from '@/lib/AuthProvider';
import { truncateAddress } from '@/util/index';

const networks = [
  { id: 'sepolia', name: 'Sepolia', chainId: '0xaa36a7', nativeCurrency: 'ETH' },
  { id: 'avalanche', name: 'Avalanche C-Chain', chainId: '0xa86a', nativeCurrency: 'AVAX' },
];

const AccountProfile = () => {
  const { theme } = useTheme();
  const { web3auth, web3User, getBalance, address } = useAuthContext();
  const [selectedNetwork, setSelectedNetwork] = useState(networks[1]);
  const [chowLiveBalance, setChowLiveBalance] = useState('0');
  const [pearlBalance, setPearlBalance] = useState('0');
  const [nativeBalance, setNativeBalance] = useState('0');
  const [creatorEarnings, setCreatorEarnings] = useState('0');
  const [walletChowBalance, setWalletChowBalance] = useState('0');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (web3auth && web3auth.provider) {
      // TODO: Fetch balances here
      // This is a placeholder
      setChowLiveBalance('10.5');
      setPearlBalance('100');
      setNativeBalance('1.5');
      setCreatorEarnings('5.25');
      setWalletChowBalance('2.75');
    }
  }, [web3auth, selectedNetwork]);

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const network = networks.find((n) => n.id === e.target.value);
    if (network) {
      setSelectedNetwork(network);
      // Implement network switching logic here
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`mt-18 px-4 sm:px-16 w-full min-h-screen ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#1a1c20] to-[#2c313c] text-gray-100'
          : 'bg-gradient-to-br from-[#F5F7FA] to-[#F9FAFB] text-gray-800'
      } rounded-t-lg`}
    >
      <h2 className='text-3xl font-bold mt-16 mb-8 pt-3'>Account Profile</h2>

      <div className='flex flex-col lg:flex-row gap-8 mb-8'>
        {/* Wallet Address Card */}
        <div className='bg-white dark:bg-[#1E2128] rounded-lg p-6 flex-1 shadow-lg'>
          <div className='flex -flex-row justify-between items-center'>
            <h3 className='text-xl font-semibold mb-4 text-[#541413] dark:text-[#E6D5C0]'>
              Wallet Address
            </h3>
            <p className='text-lg font-semibold mb-4 opacity-75'>
              {nativeBalance} {selectedNetwork.nativeCurrency}
            </p>
          </div>

          <div className='flex items-center justify-between bg-gray-100 dark:bg-[#2A2F3A] p-2 rounded mb-4'>
            <p className='font-mono truncate'>
              {address ? truncateAddress(address) : 'Not connected'}
            </p>
            <button
              onClick={copyToClipboard}
              className='ml-2 p-2 text-[#CB302B] hover:bg-[#FCEFDC] dark:hover:bg-[#3A2A2A] rounded transition-colors duration-200'
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>

          <div className='p-4 bg-[#FCEFDC] dark:bg-[#2A2F3A] bg-opacity-20 dark:bg-opacity-40 rounded-lg border border-[#CB302B] border-opacity-20 dark:border-opacity-10'>
            <h4 className='font-medium text-[#CB302B] dark:text-[#FF8080]'>
              Token Balance
              <span className='text-sm font-lighter opacity-50'> {selectedNetwork.name}</span>
            </h4>
            <p className='text-2xl font-bold text-[#541413] dark:text-[#E6D5C0]'>
              {walletChowBalance} CHOW{' '}
              <span className='text-sm font-lighter opacity-50'> (CCIPBnM)</span>
            </p>

            <button className='mt-2 px-4 py-2 bg-gradient-to-r from-[#CB302B] to-[#541413] text-white rounded hover:from-[#541413] hover:to-[#CB302B] transition-all duration-300 ease-in-out'>
              Faucet
            </button>
          </div>
        </div>

        {/* ChowLive Balances Card */}
        <div className='bg-white dark:bg-[#1E2128] rounded-lg p-6 flex-1 shadow-lg'>
          <h3 className='text-xl font-semibold mb-4 text-[#541413] dark:text-[#E6D5C0]'>
            ChowLive Tracker
          </h3>
          <div className='space-y-4'>
            <div className='p-4 bg-[#FCEFDC] dark:bg-[#2A2F3A] bg-opacity-20 dark:bg-opacity-40 rounded-lg border border-[#CB302B] border-opacity-20 dark:border-opacity-10'>
              <h4 className='font-medium text-[#CB302B] dark:text-[#FF8080]'>
                Creator Earnings <span className='text-sm font-lighter opacity-50'>Avalanche </span>
              </h4>
              <p className='text-2xl font-bold text-[#541413] dark:text-[#E6D5C0]'>
                {creatorEarnings} CHOW{' '}
                <span className='text-sm font-lighter opacity-50'> (CCIPBnM)</span>
              </p>
              <button className='mt-2 px-4 py-2 bg-gradient-to-r from-[#CB302B] to-[#541413] text-white rounded hover:from-[#541413] hover:to-[#CB302B] transition-all duration-300 ease-in-out'>
                Withdraw to Wallet
              </button>
            </div>

            <div className='p-4 h-full bg-[#FCEFDC] dark:bg-[#2A2F3A] bg-opacity-20 dark:bg-opacity-40 rounded-lg border border-[#CB302B] border-opacity-20 dark:border-opacity-10'>
              <h4 className='font-medium text-[#CB302B] dark:text-[#FF8080]'>
                Creator Credits <span className='text-sm font-lighter opacity-50'>Intersect </span>
              </h4>
              <p className='text-2xl font-bold text-[#541413] dark:text-[#E6D5C0]'>
                {creatorEarnings} Pearl
              </p>
              <button className='mt-2 px-4 py-2 bg-gradient-to-r from-[#CB302B] to-[#541413] text-white rounded hover:from-[#541413] hover:to-[#CB302B] transition-all duration-300 ease-in-out'>
                Faucet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Selection (Settings) */}
      <div className='bg-white dark:bg-[#1E2128] rounded-lg p-6 mb-8 shadow-lg'>
        <h3 className='text-xl font-semibold mb-4 text-[#541413] dark:text-[#E6D5C0] flex items-center'>
          <FiSettings className='mr-2' /> Settings
        </h3>
        <div className='flex flex-col sm:flex-row items-start sm:items-center'>
          <label
            htmlFor='network-select'
            className='mb-2 sm:mb-0 sm:mr-4 text-[#CB302B] dark:text-[#FF8080]'
          >
            Default Network for Subscription Payments:
          </label>
          <div className='flex items-center'>
            <select
              id='network-select'
              value={selectedNetwork.id}
              onChange={handleNetworkChange}
              className='bg-gray-100 dark:bg-[#2A2F3A] border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#CB302B] text-gray-800 dark:text-gray-200'
            >
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
            <span className='ml-4 text-sm text-gray-500 dark:text-gray-400'>
              Chain ID: {selectedNetwork.chainId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
